import prisma from "@/lib/prisma";
import CategoriesBrandsClient from "./CategoriesBrandsClient";

export const dynamic = "force-dynamic";

export default async function CategoriesBrandsPage() {
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
    orderBy: { name: "asc" },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 pt-6">
      <CategoriesBrandsClient categories={categories} brands={brands} />
    </div>
  );
}
