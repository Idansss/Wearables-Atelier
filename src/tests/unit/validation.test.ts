/**
 * Unit tests for validation schemas
 * Run: npm test
 */
import { describe, it, expect } from "vitest";
import {
  contactSchema,
  newsletterSchema,
  customOrderSchema,
  wholesaleSchema,
  reviewSchema,
  checkoutCustomerSchema,
  couponCodeSchema,
  formatZodErrors,
} from "../../app/lib/validation";
import { ZodError } from "zod";

// ─── Contact schema ───────────────────────────────────────────────────────────

describe("contactSchema", () => {
  it("parses valid input and trims / lowercases email", () => {
    const result = contactSchema.parse({
      name: "Amara Osei",
      email: "  AMARA@example.com  ",
      subject: "Question about sizes",
      message: "Hello, I wanted to ask about your sizing chart.",
    });
    expect(result.email).toBe("amara@example.com");
    expect(result.name).toBe("Amara Osei");
  });

  it("rejects missing name", () => {
    expect(() =>
      contactSchema.parse({ name: "", email: "a@b.com", subject: "Hi", message: "Hello" })
    ).toThrow(ZodError);
  });

  it("rejects invalid email", () => {
    expect(() =>
      contactSchema.parse({ name: "Alice", email: "not-an-email", subject: "Hi", message: "Hello" })
    ).toThrow(ZodError);
  });

  it("rejects name shorter than 2 chars", () => {
    expect(() =>
      contactSchema.parse({ name: "A", email: "a@b.com", subject: "Hi", message: "Hello" })
    ).toThrow(ZodError);
  });

  it("rejects message exceeding 2000 chars", () => {
    expect(() =>
      contactSchema.parse({
        name: "Alice",
        email: "a@b.com",
        subject: "Hi",
        message: "x".repeat(2001),
      })
    ).toThrow(ZodError);
  });
});

// ─── Newsletter schema ────────────────────────────────────────────────────────

describe("newsletterSchema", () => {
  it("defaults source to 'footer'", () => {
    const result = newsletterSchema.parse({ email: "user@test.com" });
    expect(result.source).toBe("footer");
  });

  it("accepts popup source", () => {
    const result = newsletterSchema.parse({ email: "user@test.com", source: "popup" });
    expect(result.source).toBe("popup");
  });

  it("rejects invalid source value", () => {
    expect(() =>
      newsletterSchema.parse({ email: "user@test.com", source: "unknown" })
    ).toThrow(ZodError);
  });
});

// ─── Review schema ────────────────────────────────────────────────────────────

describe("reviewSchema", () => {
  const valid = {
    productSlug: "agbada-set",
    name: "Tunde Bello",
    location: "Lagos",
    rating: 5,
    body: "Absolutely stunning piece. Arrived on time.",
  };

  it("parses a valid review", () => {
    const result = reviewSchema.parse(valid);
    expect(result.rating).toBe(5);
  });

  it("rejects rating above 5", () => {
    expect(() => reviewSchema.parse({ ...valid, rating: 6 })).toThrow(ZodError);
  });

  it("rejects rating below 1", () => {
    expect(() => reviewSchema.parse({ ...valid, rating: 0 })).toThrow(ZodError);
  });

  it("rejects empty body", () => {
    expect(() => reviewSchema.parse({ ...valid, body: "" })).toThrow(ZodError);
  });
});

// ─── Checkout customer schema ─────────────────────────────────────────────────

describe("checkoutCustomerSchema", () => {
  const valid = {
    firstName: "Zainab",
    lastName: "Adamu",
    email: "zainab@example.ng",
    phone: "+2348012345678",
    address: "12 Bode Thomas Street",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
  };

  it("parses valid checkout data", () => {
    const result = checkoutCustomerSchema.parse(valid);
    expect(result.email).toBe("zainab@example.ng");
  });

  it("rejects phone shorter than 7 chars", () => {
    expect(() =>
      checkoutCustomerSchema.parse({ ...valid, phone: "123" })
    ).toThrow(ZodError);
  });

  it("rejects address shorter than 5 chars", () => {
    expect(() =>
      checkoutCustomerSchema.parse({ ...valid, address: "123" })
    ).toThrow(ZodError);
  });
});

// ─── Coupon code schema ───────────────────────────────────────────────────────

describe("couponCodeSchema", () => {
  it("uppercases and trims the coupon code", () => {
    const result = couponCodeSchema.parse({ code: "  welcome10  " });
    expect(result.code).toBe("WELCOME10");
  });

  it("rejects codes shorter than 3 chars", () => {
    expect(() => couponCodeSchema.parse({ code: "AB" })).toThrow(ZodError);
  });
});

// ─── Custom order schema ──────────────────────────────────────────────────────

describe("customOrderSchema", () => {
  const valid = {
    name: "Ngozi Eze",
    email: "ngozi@mail.com",
    phone: "08011223344",
    occasion: "Wedding",
    garment: "Aso-oke",
    budget: "₦150,000 – ₦200,000",
    measurements: { bust: "90", waist: "72", hips: "96", height: "165" },
  };

  it("parses valid custom order with optional fields absent", () => {
    const result = customOrderSchema.parse(valid);
    expect(result.name).toBe("Ngozi Eze");
    expect(result.inspiration).toBeUndefined();
  });

  it("rejects missing occasion", () => {
    expect(() =>
      customOrderSchema.parse({ ...valid, occasion: "" })
    ).toThrow(ZodError);
  });
});

// ─── Wholesale schema ─────────────────────────────────────────────────────────

describe("wholesaleSchema", () => {
  const valid = {
    business: "Fashion Forward Ltd",
    name: "Ibrahim Musa",
    email: "ibrahim@fashionforward.ng",
    phone: "09011223344",
    categories: "Ready-to-wear, Fabrics",
    quantity: "100–200 units",
    message: "We are interested in stocking your ready-to-wear collection.",
  };

  it("parses valid wholesale inquiry", () => {
    const result = wholesaleSchema.parse(valid);
    expect(result.business).toBe("Fashion Forward Ltd");
  });

  it("rejects missing business name", () => {
    expect(() =>
      wholesaleSchema.parse({ ...valid, business: "" })
    ).toThrow(ZodError);
  });
});

// ─── formatZodErrors helper ───────────────────────────────────────────────────

describe("formatZodErrors", () => {
  it("formats Zod errors to { field, message }[]", () => {
    try {
      contactSchema.parse({ name: "", email: "bad", subject: "", message: "" });
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = formatZodErrors(err);
        expect(formatted).toBeInstanceOf(Array);
        expect(formatted.every((e) => "field" in e && "message" in e)).toBe(true);
      }
    }
  });
});
