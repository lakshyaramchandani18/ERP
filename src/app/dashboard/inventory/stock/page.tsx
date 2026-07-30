import prisma from "@/lib/prisma";
import { StockClient } from "./stock-client";

export default async function StockInventoryPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      variants: {
        include: {
          color: true,
          size: true,
        },
        orderBy: { updatedAt: "desc" }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const formattedData = products.map((p: any) => {
    // Determine overall stock and price range
    const totalStock = p.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
    const minPrice = Math.min(...p.variants.map((v: any) => v.sellingPrice));
    const maxPrice = Math.max(...p.variants.map((v: any) => v.sellingPrice));

    return {
      id: p.id,
      productId: p.id,
      name: p.name,
      code: p.code,
      hsnCode: p.hsnCode || null,
      brand: p.brand?.name || null,
      category: p.category?.name || "Uncategorized",
      gstPercent: p.gstPercent,
      taxType: p.taxType,
      updatedAt: p.updatedAt,
      // Aggregated for summary view
      stock: totalStock,
      sellingPrice: minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`,
      purchasePrice: p.variants[0]?.purchasePrice || 0, // Fallback for sorting if needed
      mrp: p.variants[0]?.mrp || 0,
      sku: p.variants.length === 1 ? p.variants[0].sku : `${p.variants.length} Variants`,
      barcode: p.variants.length === 1 ? p.variants[0].barcode : null,
      color: p.variants.length === 1 ? p.variants[0].color?.name : null,
      size: p.variants.length === 1 ? p.variants[0].size?.name : null,
      status: p.variants.every((v: any) => v.status === 'INACTIVE') ? 'INACTIVE' : 'ACTIVE',
      // Store variants array for expansion
      variants: p.variants.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        barcode: v.barcode,
        color: v.color?.name || "-",
        size: v.size?.name || "-",
        mrp: v.mrp,
        sellingPrice: v.sellingPrice,
        purchasePrice: v.purchasePrice,
        stock: v.stock,
        status: v.status,
      }))
    };
  });

  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return <StockClient data={formattedData} brands={brands} categories={categories} />;
}
