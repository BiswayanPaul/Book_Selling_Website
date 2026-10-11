"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { db } from "@/prisma/db";

export type CheckoutState = {
  errors?: Partial<Record<CheckoutField, string>>;
  message?: string;
  values?: Partial<Record<CheckoutField, string>>;
};

type CheckoutField =
  | "customerName"
  | "customerEmail"
  | "customerPhone"
  | "quantity"
  | "shippingAddress"
  | "shippingCity"
  | "shippingState"
  | "shippingPincode";

const MAX_QUANTITY = 20;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const slug = text(formData, "productSlug");
  const product = await db.orm.public.Product.where({ slug, isActive: true }).first();
  if (!product) {
    return { message: "This product is no longer available." };
  }

  const isPaperback = product.type === "PAPERBACK";
  const values = {
    customerName: text(formData, "customerName"),
    customerEmail: text(formData, "customerEmail"),
    customerPhone: text(formData, "customerPhone").replace(/[\s-]/g, ""),
    quantity: isPaperback ? text(formData, "quantity") || "1" : "1",
    shippingAddress: text(formData, "shippingAddress"),
    shippingCity: text(formData, "shippingCity"),
    shippingState: text(formData, "shippingState"),
    shippingPincode: text(formData, "shippingPincode"),
  };

  const errors: CheckoutState["errors"] = {};

  if (values.customerName.length < 2) {
    errors.customerName = "Please enter your full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.customerEmail)) {
    errors.customerEmail = "Please enter a valid email address.";
  }
  if (!/^(\+91)?[6-9]\d{9}$/.test(values.customerPhone)) {
    errors.customerPhone = "Please enter a valid 10-digit mobile number.";
  }

  const quantity = Number(values.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    errors.quantity = `Quantity must be between 1 and ${MAX_QUANTITY}.`;
  } else if (isPaperback && quantity > product.stock) {
    errors.quantity =
      product.stock > 0
        ? `Only ${product.stock} copies are in stock.`
        : "This book is out of stock.";
  }

  if (isPaperback) {
    if (values.shippingAddress.length < 5) {
      errors.shippingAddress = "Please enter your delivery address.";
    }
    if (!values.shippingCity) errors.shippingCity = "Please enter your city.";
    if (!values.shippingState) errors.shippingState = "Please enter your state.";
    if (!/^\d{6}$/.test(values.shippingPincode)) {
      errors.shippingPincode = "Please enter a valid 6-digit pincode.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  // Prices always come from the database, never from the form.
  const subtotal = product.price * quantity;

  const accessToken = randomBytes(24).toString("base64url");

  await db.transaction(async (tx) => {
    const order = await tx.orm.public.Order.create({
      accessToken,
      customerName: values.customerName,
      customerEmail: values.customerEmail.toLowerCase(),
      customerPhone: values.customerPhone,
      shippingAddress: isPaperback ? values.shippingAddress : null,
      shippingCity: isPaperback ? values.shippingCity : null,
      shippingState: isPaperback ? values.shippingState : null,
      shippingPincode: isPaperback ? values.shippingPincode : null,
      subtotal,
      totalAmount: subtotal,
    });

    await tx.orm.public.OrderItem.create({
      orderId: order.id,
      productId: product.id,
      quantity,
      unitPrice: product.price,
    });
  });

  // Without Razorpay keys the order is simply recorded, as before.
  redirect(
    isRazorpayConfigured()
      ? `/checkout/pay?token=${accessToken}`
      : `/checkout/success?token=${accessToken}`,
  );
}
