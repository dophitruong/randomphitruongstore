# Product Draft Management

## Problem

The admin product form can save a draft timestamp, but the draft is browser-local and cannot be found after leaving the form. Admins need persisted drafts that can be listed, reopened, edited, published, or deleted.

## Target Behavior

- Product drafts are stored as `Product` records with `status = DRAFT`.
- Normal products use `status = PUBLISHED`; `isActive` remains the visibility/archive flag.
- Drafts are never public or purchasable, even if `isActive = true`.
- The Products admin page shows drafts, provides a Drafts tab, and offers a Draft status filter.
- Draft rows show a Draft badge and can be reopened in the existing product form.
- Draft publish and draft delete actions require browser confirmation.

## Data Model

- Add Prisma enum `ProductStatus` with `DRAFT` and `PUBLISHED`.
- Add `Product.status ProductStatus @default(PUBLISHED)`.
- Existing products migrate to `PUBLISHED`.
- Drafts may use safe placeholder values for required non-null product fields.
- Drafts without a usable slug get a stable `draft-{uuid}` slug.

## API

- Published create/update keeps using the existing strict `productInputSchema`.
- Draft save/autosave uses a separate relaxed draft schema.
- Creating a draft returns the product ID so later autosaves update the same record.
- Updating a draft replaces draft images, variants, and size charts from the latest form payload.
- Publishing a draft uses the strict product validation and changes `status` to `PUBLISHED`.

## Autosave

- Autosave starts only after meaningful user-entered data exists.
- Default category, price, stock, and variant rows do not count as meaningful data.
- Autosave is debounced and skips duplicate unchanged payloads.
- Autosave does not run while a publish request is in progress.

## Public Exclusion

Public catalog, public product API, product detail, checkout, and order creation queries must require `status = PUBLISHED` while preserving existing `isActive` and stock checks.

## Success Criteria

- A draft persists to the database and appears in admin Products.
- The Drafts tab and Draft status filter show draft products.
- Reopening a draft restores entered draft fields.
- Save Draft updates the same draft rather than creating duplicates.
- Publish validates required fields, asks for confirmation, and changes the product to `PUBLISHED`.
- Delete asks for confirmation and removes the draft.
- Drafts cannot appear in public listings, product detail, checkout, or order creation.
