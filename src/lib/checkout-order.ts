import { buildShippingAddressSnapshot, normalizeEmail } from "@/lib/customer-account";
import type { OrderInput } from "@/lib/validations";

type CatalogProduct = {
  id: string;
  nameVi: string;
  nameEn: string;
  basePrice: number;
};

type CatalogVariant = {
  id: string;
  productId: string;
  size: string;
  colorVi: string;
  colorEn: string;
  priceAdjustment: number;
  isAvailable: boolean;
};

type CheckoutOrderStore = {
  product: {
    findMany(args: {
      where: {
        id: { in: string[] };
        isActive: true;
        stockStatus: "IN_STOCK";
      };
    }): Promise<CatalogProduct[]>;
  };
  productVariant: {
    findMany(args: {
      where: {
        id: { in: string[] };
        productId: { in: string[] };
        isAvailable: true;
      };
    }): Promise<CatalogVariant[]>;
  };
  $transaction<T>(callback: (transaction: CheckoutOrderTransaction) => Promise<T>): Promise<T>;
};

type CheckoutOrderTransaction = {
  customer: {
    findFirst(args: {
      where: { email: string };
      orderBy: { updatedAt: "desc" };
      select: { id: true };
    }): Promise<{ id: string } | null>;
    update(args: {
      where: { id: string };
      data: CustomerCheckoutData;
      select: { id: true };
    }): Promise<{ id: string }>;
    create(args: {
      data: CustomerCheckoutData & { email?: string };
      select: { id: true };
    }): Promise<{ id: string }>;
  };
  order: {
    create(args: {
      data: CheckoutOrderCreateData;
      include: {
        customer: true;
        items: true;
        shippingAddress: true;
        payments: true;
      };
    }): Promise<unknown>;
  };
};

type CustomerCheckoutData = {
  fullName: string;
  phone: string;
};

type CheckoutOrderCreateData = {
  orderNumber: string;
  shippingRegion: OrderInput["shippingRegion"];
  paymentMethod: OrderInput["paymentMethod"];
  paymentOption: "DEPOSIT_50" | "ONLINE_100";
  status: "PENDING_DEPOSIT" | "PENDING_ONLINE_PAYMENT";
  subtotalAmount: number;
  remainingAmount: number;
  shippingFee: number;
  totalAmount: number;
  note: string | null;
  customerId: string;
  sizeColorLocked: boolean;
  noChangePolicyAck: true;
  noChangePolicyAckAt: Date;
  shippingAddress: {
    create: ReturnType<typeof buildShippingAddressSnapshot>;
  };
  items: {
    create: Array<{
      productId: string;
      productVariantId?: string;
      productName: string;
      itemNameSnapshot: string;
      unitPrice: number;
      lineTotal: number;
      quantity: number;
      size: string;
      selectedSize: string;
      color: string;
      selectedColor: string;
    }>;
  };
  payments: {
    create: {
      paymentType: "DEPOSIT" | "FULL_PAYMENT";
      paymentMethod: OrderInput["paymentMethod"];
      paymentStatus: "PENDING";
      amount: number;
    };
  };
};

export class CheckoutOrderError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "CheckoutOrderError";
  }
}

export async function createCheckoutOrder({
  prisma,
  input,
  userEmail,
  generateOrderNumber,
  now = () => new Date()
}: {
  prisma: CheckoutOrderStore;
  input: OrderInput;
  userEmail: string | null | undefined;
  generateOrderNumber: () => string;
  now?: () => Date;
}) {
  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const variantIds = [
    ...new Set(
      input.items.map((item) => item.productVariantId)
    )
  ];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true, stockStatus: "IN_STOCK" }
  });

  if (products.length !== productIds.length) {
    throw new CheckoutOrderError("One or more products are unavailable", 409);
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      productId: { in: productIds },
      isAvailable: true
    }
  });

  const productMap = new Map(products.map((product) => [product.id, product]));
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  const orderItems = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new CheckoutOrderError("One or more products are unavailable", 409);
    }

    const variant = variantMap.get(item.productVariantId);

    if (!variant || variant.productId !== item.productId) {
      throw new CheckoutOrderError("Invalid product variant", 400);
    }

    const selectedSize = variant.size;
    const selectedColor = variant.colorVi;
    const unitPrice = product.basePrice + variant.priceAdjustment;

    return {
      productId: item.productId,
      productVariantId: item.productVariantId,
      productName: product.nameVi,
      itemNameSnapshot: product.nameVi,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      quantity: item.quantity,
      size: selectedSize,
      selectedSize,
      color: selectedColor,
      selectedColor
    };
  });

  const subtotalAmount = orderItems.reduce((total, item) => total + item.lineTotal, 0);
  const isDeposit = input.paymentMethod === "DEPOSIT_50_BANK_ZALO";
  const depositPaymentAmount = isDeposit ? Math.ceil(subtotalAmount / 2) : null;
  const shippingFee = 0;
  const totalAmount = subtotalAmount + shippingFee;
  const remainingAmount =
    depositPaymentAmount === null ? 0 : totalAmount - depositPaymentAmount;
  const paymentOption = isDeposit ? "DEPOSIT_50" : "ONLINE_100";
  const paymentAmount = depositPaymentAmount ?? totalAmount;
  const normalizedEmail = normalizeEmail(userEmail);
  const customerData = customerDataFromCheckout(input);

  return prisma.$transaction(async (transaction) => {
    const customer = normalizedEmail
      ? await findOrCreateSignedInCustomer(transaction, normalizedEmail, customerData)
      : await transaction.customer.create({
          data: customerData,
          select: { id: true }
        });

    return transaction.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        shippingRegion: input.shippingRegion,
        paymentMethod: input.paymentMethod,
        paymentOption,
        status: isDeposit ? "PENDING_DEPOSIT" : "PENDING_ONLINE_PAYMENT",
        subtotalAmount,
        remainingAmount,
        shippingFee,
        totalAmount,
        note: input.note || null,
        customerId: customer.id,
        sizeColorLocked: true,
        noChangePolicyAck: true,
        noChangePolicyAckAt: now(),
        shippingAddress: {
          create: buildShippingAddressSnapshot(input)
        },
        items: {
          create: orderItems
        },
        payments: {
          create: {
            paymentType: isDeposit ? "DEPOSIT" : "FULL_PAYMENT",
            paymentMethod: input.paymentMethod,
            paymentStatus: "PENDING",
            amount: paymentAmount
          }
        }
      },
      include: {
        customer: true,
        items: true,
        shippingAddress: true,
        payments: true
      }
    });
  });
}

function customerDataFromCheckout(input: OrderInput): CustomerCheckoutData {
  return {
    fullName: input.fullName,
    phone: input.phone
  };
}

async function findOrCreateSignedInCustomer(
  transaction: CheckoutOrderTransaction,
  email: string,
  customerData: CustomerCheckoutData
) {
  const customer = await transaction.customer.findFirst({
    where: { email },
    orderBy: { updatedAt: "desc" },
    select: { id: true }
  });

  if (customer) {
    return transaction.customer.update({
      where: { id: customer.id },
      data: customerData,
      select: { id: true }
    });
  }

  return transaction.customer.create({
    data: {
      email,
      ...customerData
    },
    select: { id: true }
  });
}
