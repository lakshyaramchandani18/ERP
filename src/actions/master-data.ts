"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(data: any) {
  try {
    let name = typeof data === "string" ? data : data?.name || (data?.get ? data.get("name") : null);
    let description = data?.description || (data?.get ? data.get("description") : null);

    if (!name) return { error: "Name is required" };

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
      },
    });
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/categories-brands");
    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { error: error.message || "Failed to create category" };
  }
}

export async function createSubcategory(data: { categoryId: string; name: string }) {
  try {
    if (!data.categoryId || !data.name) {
      return { error: "Category ID and Subcategory Name are required." };
    }
    const sub = await prisma.subcategory.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
      },
    });
    revalidatePath("/dashboard/categories-brands");
    return { success: true, subcategory: sub };
  } catch (error: any) {
    return { error: error.message || "Failed to create subcategory" };
  }
}

export async function updateCategory(data: any, formData?: FormData) {
  try {
    let id = typeof data === "string" ? data : data?.id;
    let isActive = data?.isActive;
    let name = data?.name || (formData?.get ? formData.get("name") : null);
    let description = data?.description || (formData?.get ? formData.get("description") : null);

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/categories-brands");
    return { success: true, category };
  } catch (error: any) {
    return { error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (category && category._count.products > 0) {
      return { error: "Cannot delete category because it has linked products." };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/categories-brands");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete category" };
  }
}

export async function createBrand(data: any) {
  try {
    let name = typeof data === "string" ? data : data?.name || (data?.get ? data.get("name") : null);
    let description = data?.description || (data?.get ? data.get("description") : null);

    if (!name) return { error: "Name is required" };

    const brand = await prisma.brand.create({
      data: {
        name,
        description: description || null,
      },
    });
    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/categories-brands");
    return { success: true, brand };
  } catch (error: any) {
    console.error("Failed to create brand:", error);
    return { error: error.message || "Failed to create brand" };
  }
}

export async function updateBrand(data: any) {
  try {
    let id = data?.id;
    let isActive = data?.isActive;
    let name = data?.name;
    let description = data?.description;

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/categories-brands");
    return { success: true, brand };
  } catch (error: any) {
    return { error: error.message || "Failed to update brand" };
  }
}

export async function deleteBrand(id: string) {
  try {
    await prisma.brand.delete({ where: { id } });
    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/categories-brands");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete brand" };
  }
}

export async function toggleCategory(id: string, isActive: boolean) {
  return updateCategory({ id, isActive });
}

export async function createColor(formData: FormData) {
  const name = formData.get("name") as string;
  const hex = formData.get("hex") as string;
  if (!name) return { error: "Name is required" };
  try {
    await prisma.color.create({
      data: { name, hexCode: hex },
    });
    revalidatePath("/dashboard/products/new");
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create color" };
  }
}

export async function createSize(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name) return { error: "Name is required" };
  try {
    await prisma.size.create({
      data: { name },
    });
    revalidatePath("/dashboard/products/new");
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create size" };
  }
}
