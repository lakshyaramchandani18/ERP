import prisma from "@/lib/prisma";
import { NewProductForm } from "./new-product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const sizes = await prisma.size.findMany({ orderBy: { name: "asc" } });
  const colors = await prisma.color.findMany({ orderBy: { name: "asc" } });

  return <NewProductForm categories={categories} brands={brands} sizes={sizes} colors={colors} />;
}
