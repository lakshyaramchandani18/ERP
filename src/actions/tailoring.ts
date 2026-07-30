"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTailoringOrders() {
  try {
    const orders = await prisma.tailoringOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
      },
    });
    return { success: true, data: orders };
  } catch (error: any) {
    console.error("Failed to fetch tailoring orders:", error);
    return { success: false, error: error.message };
  }
}

export async function createTailoringOrder(data: any) {
  try {
    // Generate a unique order number like TAILOR-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
    const orderNumber = `T-${dateStr}-${randomHex}`;

    const order = await prisma.tailoringOrder.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        deliveryDate: new Date(data.deliveryDate),
        status: "MEASURED",
        measurements: data.measurements, // Expecting a JSON object
        fabricDetails: data.fabricDetails,
        estimatedCost: parseFloat(data.estimatedCost) || 0,
        advancePaid: parseFloat(data.advancePaid) || 0,
      }
    });
    
    revalidatePath("/dashboard/sales/tailoring");
    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("Failed to create tailoring order:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTailoringStatus(orderId: string, status: string) {
  try {
    await prisma.tailoringOrder.update({
      where: { id: orderId },
      data: { status }
    });
    
    revalidatePath("/dashboard/sales/tailoring");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update tailoring status:", error);
    return { success: false, error: error.message };
  }
}
