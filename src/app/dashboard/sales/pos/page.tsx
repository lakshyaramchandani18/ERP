import prisma from "@/lib/prisma";
import PosKeyboardClient from "./PosKeyboardClient";

export default async function POSPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { subcategories: true },
    orderBy: { name: "asc" },
  });

  const products = await prisma.product.findMany({
    include: {
      category: true,
      subcategory: true,
      variants: {
        include: {
          color: true,
          size: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <PosKeyboardClient
      categories={categories}
      products={products}
      customers={customers}
    />
  );
}
