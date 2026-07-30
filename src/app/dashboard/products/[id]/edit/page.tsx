import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditProductForm } from "./edit-product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      variants: {
        include: { color: true, size: true }
      }
    }
  });

  if (!product) return notFound();

  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const sizes = await prisma.size.findMany({ orderBy: { name: "asc" } });
  const colors = await prisma.color.findMany({ orderBy: { name: "asc" } });

  return (
    <EditProductForm 
      product={product} 
      categories={categories} 
      brands={brands} 
      sizes={sizes} 
      colors={colors} 
    />
  );
}
