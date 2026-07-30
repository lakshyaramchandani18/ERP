"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProductAction(data: any) {
  if (!data.name) {
    return { success: false, error: "Product Name is required" };
  }
  
  // Prepare variants array
  const activeVariants = data.hasVariants && Array.isArray(data.variants) ? data.variants : [data];
  
  if (activeVariants.length === 0) {
    return { success: false, error: "At least one variant is required" };
  }

  // Validate variants
  for (let i = 0; i < activeVariants.length; i++) {
    const v = activeVariants[i];
    const sp = parseFloat(v.sellingPrice) || 0;
    const pp = parseFloat(v.purchasePrice) || 0;
    const st = parseFloat(v.stock) || 0;

    if (sp < pp) {
      return { success: false, error: `Row ${i + 1}: Selling Price cannot be less than Purchase Price` };
    }
    if (st < 0) {
      return { success: false, error: `Row ${i + 1}: Stock cannot be negative` };
    }
  }

  // Sanitize empty strings to null for relations and optional fields
  const sanitize = (val: any) => (val === "" || val === undefined) ? null : val;

  try {
    await prisma.$transaction(async (tx: any) => {
      // 1. Create the Master Product
      const product = await tx.product.create({
        data: {
          name: data.name,
          code: sanitize(data.code) || `PRD-${Date.now()}`,
          hsnCode: sanitize(data.hsnCode),
          description: sanitize(data.description),
          categoryId: sanitize(data.categoryId),
          brandId: sanitize(data.brandId),
          gender: sanitize(data.gender),
          unit: sanitize(data.unit) || "Piece",
          taxType: sanitize(data.taxType) || "NO_TAX",
          gstPercent: (sanitize(data.taxType) || "NO_TAX") === "NO_TAX" ? 0 : (parseFloat(data.gstPercent) || 0),
          taxIncluded: (sanitize(data.taxType) || "NO_TAX") === "NO_TAX" ? false : (data.taxIncluded === "true" || data.taxIncluded === true || false),
        },
      });

      // 2. Create the Variants
      for (const v of activeVariants) {
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: sanitize(v.sku) || `${product.code}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
            barcode: sanitize(v.barcode),
            sizeId: sanitize(v.sizeId),
            colorId: sanitize(v.colorId),
            purchasePrice: parseFloat(v.purchasePrice) || 0,
            mrp: parseFloat(v.mrp) || 0,
            sellingPrice: parseFloat(v.sellingPrice) || 0,
            wholesalePrice: parseFloat(v.sellingPrice) || 0,
            stock: parseFloat(v.stock) || 0,
            status: "ACTIVE",
          },
        });

        // 3. Log the opening stock movement if stock > 0
        if (parseFloat(v.stock) > 0) {
          await tx.stockMovement.create({
            data: {
              variantId: variant.id,
              type: "OPENING_STOCK",
              quantity: parseFloat(v.stock),
              referenceId: "Initial Inventory",
              remarks: "Added during product creation",
            }
          });
        }
      }
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create product:", error);
    // Return friendly error if unique constraint failed (like duplicate SKU)
    if (error.code === 'P2002') {
      return { success: false, error: `Duplicate entry found for: ${error.meta?.target}` };
    }
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProductAction(id: string, data: any) {
  if (!data.name) {
    return { success: false, error: "Product Name is required" };
  }
  
  const activeVariants = data.hasVariants && Array.isArray(data.variants) ? data.variants : [data];
  if (activeVariants.length === 0) {
    return { success: false, error: "At least one variant is required" };
  }

  for (let i = 0; i < activeVariants.length; i++) {
    const v = activeVariants[i];
    const sp = parseFloat(v.sellingPrice) || 0;
    const pp = parseFloat(v.purchasePrice) || 0;
    const st = parseFloat(v.stock) || 0;

    if (sp < pp) {
      return { success: false, error: `Row ${i + 1}: Selling Price cannot be less than Purchase Price` };
    }
    if (st < 0) {
      return { success: false, error: `Row ${i + 1}: Stock cannot be negative` };
    }
  }

  const sanitize = (val: any) => (val === "" || val === undefined) ? null : val;

  try {
    await prisma.$transaction(async (tx: any) => {
      // 1. Update Master Product
      const product = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          code: sanitize(data.code) || `PRD-${Date.now()}`,
          hsnCode: sanitize(data.hsnCode),
          description: sanitize(data.description),
          categoryId: sanitize(data.categoryId),
          brandId: sanitize(data.brandId),
          gender: sanitize(data.gender),
          unit: sanitize(data.unit) || "Piece",
          taxType: sanitize(data.taxType) || "NO_TAX",
          gstPercent: (sanitize(data.taxType) || "NO_TAX") === "NO_TAX" ? 0 : (parseFloat(data.gstPercent) || 0),
          taxIncluded: (sanitize(data.taxType) || "NO_TAX") === "NO_TAX" ? false : (data.taxIncluded === "true" || data.taxIncluded === true || false),
        },
      });

      // 2. Fetch existing variants to know what to delete
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id }
      });
      const incomingIds = activeVariants.map((v: any) => v.id).filter((vid: string) => !vid.includes('.')); // '.' implies Math.random()

      const variantsToDelete = existingVariants.filter((ev: any) => !incomingIds.includes(ev.id));
      for (const vd of variantsToDelete) {
        // Safe delete (will throw if it has foreign keys in sales, which is correct)
        await tx.productVariant.delete({ where: { id: vd.id } });
      }

      // 3. Upsert Variants
      for (const v of activeVariants) {
        const isNew = v.id?.includes('.'); // Our client-side random id contains a dot
        const sp = parseFloat(v.sellingPrice) || 0;
        const pp = parseFloat(v.purchasePrice) || 0;
        const st = parseFloat(v.stock) || 0;

        if (isNew || !v.id) {
          const variant = await tx.productVariant.create({
            data: {
              productId: id,
              sku: sanitize(v.sku) || `${product.code}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
              barcode: sanitize(v.barcode),
              sizeId: sanitize(v.sizeId),
              colorId: sanitize(v.colorId),
              purchasePrice: pp,
              mrp: parseFloat(v.mrp) || 0,
              sellingPrice: sp,
              wholesalePrice: sp,
              stock: st,
              status: "ACTIVE",
            }
          });
          if (st > 0) {
            await tx.stockMovement.create({
              data: { variantId: variant.id, type: "OPENING_STOCK", quantity: st, referenceId: "Initial Inventory", remarks: "Added during product edit" }
            });
          }
        } else {
          // Update existing
          const existingVariant = existingVariants.find((ev: any) => ev.id === v.id);
          const diff = existingVariant ? st - existingVariant.stock : 0;

          const variant = await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: sanitize(v.sku),
              barcode: sanitize(v.barcode),
              sizeId: sanitize(v.sizeId),
              colorId: sanitize(v.colorId),
              purchasePrice: pp,
              mrp: parseFloat(v.mrp) || 0,
              sellingPrice: sp,
              wholesalePrice: sp,
              stock: st,
            }
          });

          if (diff !== 0) {
            await tx.stockMovement.create({
              data: {
                variantId: variant.id,
                type: diff > 0 ? "MANUAL_ADJUSTMENT_IN" : "MANUAL_ADJUSTMENT_OUT",
                quantity: Math.abs(diff),
                referenceId: "Edit Product",
                remarks: "Stock manually adjusted during product edit",
              }
            });
          }
        }
      }
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory/stock");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating product:", error);
    if (error.code === 'P2003') {
      return { success: false, error: "Cannot delete a variant that has been used in sales/purchases." };
    }
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/inventory/stock");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product. It may be linked to existing records." };
  }
}
