import { db } from "@/prisma/db";

// Looks up an order from the token in a customer's link.
export async function getOrderByToken(token: unknown) {
  if (typeof token !== "string" || token.length < 20) return null;
  return db.orm.public.Order.where({ accessToken: token })
    .include("items", (items) => items.include("product"))
    .include("payment")
    .first();
}
