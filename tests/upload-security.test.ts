import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  logUploadFailure,
  uploadFailureLogMetadata,
  validateImageUpload
} from "../src/lib/upload";
import {
  ADMIN_UPLOAD_AUTH_ERROR,
  CUSTOMER_UPLOAD_AUTH_ERROR,
  resolveUploadAuthorization
} from "../src/lib/upload-authorization";

describe("secure upload flow", () => {
  it("detects image type from magic bytes instead of trusting file.type", async () => {
    const png = new File(
      [
        new Uint8Array([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
          0x00, 0x00, 0x00, 0x0d
        ])
      ],
      "spoofed.txt",
      { type: "text/plain" }
    );

    const upload = await validateImageUpload(png);

    assert.equal(upload.mimeType, "image/png");
    assert.equal(upload.extension, "png");
  });

  it("rejects files whose bytes are not an allowed image", async () => {
    const spoofed = new File([new TextEncoder().encode("not an image")], "image.png", {
      type: "image/png"
    });

    await assert.rejects(
      validateImageUpload(spoofed),
      /Only JPG, PNG and WebP images are supported/
    );
  });

  it("rejects images larger than the upload size limit", async () => {
    const oversized = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      "oversized.png",
      { type: "image/png" }
    );

    await assert.rejects(
      validateImageUpload(oversized),
      /Image must be 5 MB or smaller/
    );
  });

  it("requires an admin session or a signed-in customer for every upload", () => {
    assert.deepEqual(
      resolveUploadAuthorization({
        purpose: "ADMIN_PRODUCT_IMAGE",
        isAdminUpload: false,
        isCustomerSignedIn: true
      }),
      { ok: false, status: 401, error: ADMIN_UPLOAD_AUTH_ERROR }
    );
    assert.deepEqual(
      resolveUploadAuthorization({
        purpose: "PRODUCT_INQUIRY_IMAGE",
        isAdminUpload: false,
        isCustomerSignedIn: false
      }),
      { ok: false, status: 401, error: CUSTOMER_UPLOAD_AUTH_ERROR }
    );
    assert.deepEqual(
      resolveUploadAuthorization({
        purpose: "PRODUCT_INQUIRY_IMAGE",
        isAdminUpload: false,
        isCustomerSignedIn: true
      }),
      { ok: true }
    );
    assert.deepEqual(
      resolveUploadAuthorization({
        purpose: "ADMIN_PRODUCT_IMAGE",
        isAdminUpload: true,
        isCustomerSignedIn: false
      }),
      { ok: true }
    );
  });

  it("logs storage failures with sanitized metadata only", () => {
    const secretUrl = "postgresql://admin:super-secret-password@db.internal/store";
    const error = new Error(`Supabase Storage upload failed for ${secretUrl}`);
    Object.assign(error, {
      code: "storage_unavailable",
      stack: `stack includes ${secretUrl}`
    });

    assert.deepEqual(
      uploadFailureLogMetadata({
        error,
        operation: "upload.save",
        requestId: "req_123"
      }),
      {
        operation: "upload.save",
        requestId: "req_123",
        errorCode: "storage_unavailable"
      }
    );

    const { calls, restore } = captureConsoleError();
    try {
      logUploadFailure({
        error,
        operation: "upload.save",
        requestId: "req_123"
      });
    } finally {
      restore();
    }

    const serializedCalls = JSON.stringify(calls);
    assert.match(serializedCalls, /upload.save/);
    assert.match(serializedCalls, /req_123/);
    assert.match(serializedCalls, /storage_unavailable/);
    assert.equal(serializedCalls.includes(secretUrl), false);
    assert.equal(serializedCalls.includes("Supabase Storage upload failed"), false);
    assert.equal(serializedCalls.includes("stack"), false);
    assert.equal(calls.some((call) => call.some((item) => item instanceof Error)), false);
  });
});

function captureConsoleError() {
  const original = console.error;
  const calls: unknown[][] = [];
  console.error = (...args: unknown[]) => {
    calls.push(args);
  };

  return {
    calls,
    restore() {
      console.error = original;
    }
  };
}
