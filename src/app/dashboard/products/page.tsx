import prisma from "@/lib/prisma";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      brand: true,
      _count: {
        select: { variants: true }
      }
    }
  });

  const formattedProducts = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    code: p.code,
    category: p.category ? { name: p.category.name } : { name: "Uncategorized" },
    brand: p.brand ? { name: p.brand.name } : null,
    variantsCount: p._count.variants,
  }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Manage your master products and variants.
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="flex-1 rounded-xl shadow-sm bg-white dark:bg-gray-950 p-6 border dark:border-gray-800">
        <DataTable columns={columns} data={formattedProducts} />
      </div>
    </div>
  );
}
