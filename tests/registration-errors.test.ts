import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { registrationClientResult } from "../src/lib/auth-registration";

describe("registration error normalization", () => {
  it("returns clear client error response for duplicate email errors", () => {
    const result = registrationClientResult({
      user: null,
      error: { message: "User already registered" }
    });

    assert.equal(result.success, false);
    assert.equal(result.status, 400);
    assert.equal(result.error, "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.");
  });

  it("handles captcha verification failure gracefully", () => {
    const result = registrationClientResult({
      user: null,
      error: { message: "captcha verification failed" }
    });

    assert.equal(result.success, false);
    assert.equal(result.status, 400);
    assert.equal(result.error, "Xác thực CAPTCHA không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
  });

  it("does not expose raw provider errors for generic errors", () => {
    const result = registrationClientResult({
      user: null,
      error: { message: "Supabase provider internal stack detail database connection failure" }
    });

    assert.equal(result.success, false);
    assert.equal(result.status, 400);
    assert.equal(JSON.stringify(result).includes("Supabase provider"), false);
    assert.equal(result.error, "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin và thử lại.");
  });

  it("returns email confirmation required when user is created without session", () => {
    const result = registrationClientResult({
      user: { id: "u-123", email: "user@example.com" },
      session: null,
      error: null
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 201);
    if (result.success) {
      assert.equal(result.body.requiresEmailConfirmation, true);
      assert.match(result.body.message, /kích hoạt tài khoản/);
    }
  });

  it("returns auto-confirmed success when session is returned", () => {
    const result = registrationClientResult({
      user: { id: "u-123", email: "user@example.com" },
      session: { access_token: "token-abc" },
      error: null
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 201);
    if (result.success) {
      assert.equal(result.body.requiresEmailConfirmation, false);
    }
  });
});
