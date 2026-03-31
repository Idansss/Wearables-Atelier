/**
 * Zod validation schemas for all public-facing inputs.
 *
 * Principle: validate at the edge — every user-submitted payload is checked
 * before it reaches the database layer. Services receive clean, typed data.
 *
 * Usage:
 *   import { contactSchema } from '@/app/lib/validation';
 *   const parsed = contactSchema.parse(formData); // throws ZodError on failure
 *   const result = contactSchema.safeParse(formData); // returns { success, data, error }
 */

import { z } from "zod";

// ─── Shared primitives ────────────────────────────────────────────────────────

const emailField = z
  .string({ required_error: "Email is required" })
  .transform((v) => v.trim().toLowerCase())
  .pipe(
    z
      .string()
      .email("Please enter a valid email address")
      .max(254, "Email is too long")
  );

const nameField = (label = "Name") =>
  z
    .string({ required_error: `${label} is required` })
    .min(2, `${label} must be at least 2 characters`)
    .max(100, `${label} must be 100 characters or less`)
    .transform((v) => v.trim());

const phoneField = z
  .string()
  .max(30, "Phone number is too long")
  .transform((v) => v.trim())
  .optional()
  .or(z.literal(""));

const shortText = (label: string, maxLen = 200) =>
  z
    .string({ required_error: `${label} is required` })
    .min(1, `${label} is required`)
    .max(maxLen, `${label} must be ${maxLen} characters or less`)
    .transform((v) => v.trim());

const longText = (label: string, maxLen = 2000) =>
  z
    .string({ required_error: `${label} is required` })
    .min(1, `${label} is required`)
    .max(maxLen, `${label} must be ${maxLen} characters or less`)
    .transform((v) => v.trim());

const optionalLongText = (maxLen = 2000) =>
  z
    .string()
    .max(maxLen, `Must be ${maxLen} characters or less`)
    .transform((v) => v.trim())
    .optional()
    .or(z.literal(""));

// ─── Contact form ──────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: nameField("Name"),
  email: emailField,
  subject: shortText("Subject"),
  message: longText("Message"),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ─── Newsletter subscription ───────────────────────────────────────────────────

export const newsletterSchema = z.object({
  email: emailField,
  source: z.enum(["footer", "popup"]).default("footer"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// ─── Custom / bespoke order ───────────────────────────────────────────────────

const measurementField = z
  .string()
  .max(20, "Measurement must be 20 characters or less")
  .transform((v) => v.trim())
  .optional()
  .or(z.literal(""));

export const customOrderSchema = z.object({
  name: nameField("Full name"),
  email: emailField,
  phone: phoneField,
  occasion: shortText("Occasion"),
  garment: shortText("Garment type"),
  budget: shortText("Budget range"),
  eventDate: z
    .string()
    .max(50)
    .transform((v) => v.trim())
    .optional()
    .or(z.literal("")),
  measurements: z.object({
    bust: measurementField,
    waist: measurementField,
    hips: measurementField,
    height: measurementField,
  }),
  inspiration: optionalLongText(),
  notes: optionalLongText(),
});

export type CustomOrderInput = z.infer<typeof customOrderSchema>;

// ─── Wholesale inquiry ────────────────────────────────────────────────────────

export const wholesaleSchema = z.object({
  business: shortText("Business name"),
  name: nameField("Contact name"),
  email: emailField,
  phone: phoneField,
  categories: shortText("Product categories"),
  quantity: shortText("Quantity needed"),
  message: longText("Message"),
});

export type WholesaleInput = z.infer<typeof wholesaleSchema>;

// ─── Product review ───────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  productSlug: z
    .string()
    .min(1, "Product is required")
    .max(100),
  name: nameField("Your name"),
  location: z
    .string()
    .max(100, "Location must be 100 characters or less")
    .transform((v) => v.trim())
    .optional()
    .or(z.literal("")),
  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  body: longText("Review", 1000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// ─── Checkout ─────────────────────────────────────────────────────────────────

export const checkoutCustomerSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  email: emailField,
  phone: z
    .string({ required_error: "Phone number is required" })
    .min(7, "Please enter a valid phone number")
    .max(30)
    .transform((v) => v.trim()),
  address: z
    .string({ required_error: "Address is required" })
    .min(5, "Please enter your full street address")
    .max(300)
    .transform((v) => v.trim()),
  city: shortText("City", 100),
  state: shortText("State / Province", 100),
  country: shortText("Country", 100),
});

export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;

// ─── Coupon code ──────────────────────────────────────────────────────────────

export const couponCodeSchema = z.object({
  code: z
    .string({ required_error: "Coupon code is required" })
    .min(3, "Coupon code is too short")
    .max(50, "Coupon code is too long")
    .transform((v) => v.trim().toUpperCase()),
});

export type CouponCodeInput = z.infer<typeof couponCodeSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats ZodError into the standard `{ field, message }[]` shape
 * consistent with the API error response format.
 */
export function formatZodErrors(
  error: z.ZodError
): Array<{ field: string; message: string }> {
  return error.errors.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
}
