import "dotenv/config";
import { db } from "../src/prisma/db";

async function main() {
  const paperback = await db.orm.public.Product.create({
    name: "The All-in-One Medical Review",
    slug: "the-all-in-one-medical-review-paperback",
    description:
      "2025 Edition — Medical review book for nurses, medical and paramedical students.",
    type: "PAPERBACK",
    price: 19900,
    stock: 100,
    isActive: true,
  });

  const pdf = await db.orm.public.Product.create({
    name: "The All-in-One Medical Review",
    slug: "the-all-in-one-medical-review-pdf",
    description:
      "2025 Edition — Digital PDF edition of The All-in-One Medical Review.",
    type: "PDF",
    price: 9900,
    stock: 0,
    isActive: true,
  });

  console.log("Created products:");
  console.log(paperback);
  console.log(pdf);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
