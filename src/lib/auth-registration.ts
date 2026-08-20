export type RegistrationResult =
  | {
      success: true;
      status: 201;
      body: {
        user: unknown;
        requiresEmailConfirmation: boolean;
        message: string;
      };
    }
  | {
      success: false;
      status: 400 | 422 | 500;
      error: string;
    };

export function registrationClientResult({
  user,
  session,
  error
}: {
  user?: unknown;
  session?: unknown;
  error?: { message?: string; status?: number } | null;
}): RegistrationResult {
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (
      msg.includes("already registered") ||
      msg.includes("already exists") ||
      msg.includes("user_already_exists")
    ) {
      return {
        success: false,
        status: 400,
        error: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác."
      };
    }
    if (msg.includes("captcha")) {
      return {
        success: false,
        status: 400,
        error: "Xác thực CAPTCHA không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
      };
    }
    if (msg.includes("password")) {
      return {
        success: false,
        status: 400,
        error: error.message || "Mật khẩu chưa đáp ứng yêu cầu bảo mật."
      };
    }
    return {
      success: false,
      status: 400,
      error: "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin và thử lại."
    };
  }

  const requiresEmailConfirmation = !session;

  return {
    success: true,
    status: 201,
    body: {
      user: user ?? null,
      requiresEmailConfirmation,
      message: requiresEmailConfirmation
        ? "Đăng ký thành công! Vui lòng kiểm tra hộp thư email (kể cả thư mục Spam) để kích hoạt tài khoản trước khi đăng nhập."
        : "Đăng ký tài khoản thành công!"
    }
  };
}

