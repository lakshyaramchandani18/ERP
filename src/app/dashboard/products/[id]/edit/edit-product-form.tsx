"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { QuickAddDialog } from "@/components/master-data/quick-add-dialog";
import { createBrand, createCategory, createColor, createSize } from "@/actions/master-data";
import { updateProductAction } from "@/actions/products";

export function EditProductForm({ product, categories, brands, sizes, colors }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultVariant = product.variants?.[0] || {};
  const [hasVariants, setHasVariants] = useState(product.variants?.length > 1);
  const [variants, setVariants] = useState(
    product.variants?.length > 0 
      ? product.variants.map((v: any) => ({
          id: v.id,
          sku: v.sku || "",
          barcode: v.barcode || "",
          colorId: v.colorId || "",
          sizeId: v.sizeId || "",
          purchasePrice: v.purchasePrice?.toString() || "0",
          mrp: v.mrp?.toString() || "0",
          sellingPrice: v.sellingPrice?.toString() || "0",
          stock: v.stock?.toString() || "0"
        }))
      : [{
          id: Math.random().toString(),
          sku: "",
          barcode: "",
          colorId: "",
          sizeId: "",
          purchasePrice: "0",
          mrp: "0",
          sellingPrice: "0",
          stock: "0"
        }]
  );

  const [formData, setFormData] = useState({
    name: product.name || "",
    code: product.code || "",
    hsnCode: product.hsnCode || "",
    description: product.description || "",
    categoryId: product.categoryId || "",
    brandId: product.brandId || "",
    colorId: defaultVariant.colorId || "",
    sizeId: defaultVariant.sizeId || "",
    gender: product.gender || "",
    unit: product.unit || "Piece",
    taxType: product.taxType || "NO_TAX",
    gstPercent: product.gstPercent?.toString() || "0",
    taxIncluded: product.taxIncluded || false,
    sku: defaultVariant.sku || "",
    barcode: defaultVariant.barcode || "",
    purchasePrice: defaultVariant.purchasePrice?.toString() || "0",
    mrp: defaultVariant.mrp?.toString() || "0",
    sellingPrice: defaultVariant.sellingPrice?.toString() || "0",
    stock: defaultVariant.stock?.toString() || "0"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenerateSKU = () => {
    if (!formData.name) return;
    const prefix = formData.name.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, sku: `${prefix}-${random}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Only Name, Purchase Price, Selling Price, MRP, and Opening Quantity are strictly enforced by the server action
    // But we'll do client-side negative checks
    if (parseFloat(formData.stock) < 0) {
      setError("Opening Quantity cannot be negative.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        hasVariants,
        variants: hasVariants ? variants : undefined
      };
      const result = await updateProductAction(product.id, payload);
      if (result.success) {
        router.push("/dashboard/inventory/stock"); // Or keep them here
      } else {
        setError(result.error || "Failed to update product");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory/stock">
            <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-sm text-muted-foreground">
              Update the master product and initial inventory variant.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory/stock">
            <Button variant="outline" type="button" disabled={loading}>Cancel</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold">General Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Product Name <span className="text-red-500">*</span></label>
                <Input name="name" required placeholder="e.g. Premium Cotton Polo Shirt" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Code</label>
                <Input name="code" placeholder="e.g. POLO-001" value={formData.code} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">HSN Code</label>
                <Input name="hsnCode" placeholder="e.g. 6105" value={formData.hsnCode} onChange={handleChange} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Detailed product description..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Enable Variants</h2>
              <p className="text-sm text-muted-foreground">Add multiple sizes, colors, and prices under this product.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Pricing & Inventory */}
          {!hasVariants ? (
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">SKU</label>
                  <button type="button" onClick={handleGenerateSKU} className="text-xs text-blue-600 hover:underline">Generate</button>
                </div>
                <Input name="sku" placeholder="Auto-generated if blank" value={formData.sku} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Barcode</label>
                <Input name="barcode" placeholder="Enter barcode or leave blank" value={formData.barcode} onChange={handleChange} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Price (₹) <span className="text-red-500">*</span></label>
                <Input name="purchasePrice" type="number" step="0.01" min="0" required value={formData.purchasePrice} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">MRP (₹) <span className="text-red-500">*</span></label>
                <Input name="mrp" type="number" step="0.01" min="0" required value={formData.mrp} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Selling Price (₹) <span className="text-red-500">*</span></label>
                <Input name="sellingPrice" type="number" step="0.01" min="0" required value={formData.sellingPrice} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity <span className="text-red-500">*</span></label>
                <Input name="stock" type="number" step="1" min="0" required value={formData.stock} onChange={handleChange} />
              </div>
            </div>
          </div>
          ) : (
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-6 overflow-x-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product Variants</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { id: Math.random().toString(), sku: "", barcode: "", colorId: "", sizeId: "", purchasePrice: "0", mrp: "0", sellingPrice: "0", stock: "0" }])}>+ Add Row</Button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-2 py-3">Color</th>
                  <th className="px-2 py-3">Size</th>
                  <th className="px-2 py-3">SKU *</th>
                  <th className="px-2 py-3">Barcode</th>
                  <th className="px-2 py-3 w-24">Purchase *</th>
                  <th className="px-2 py-3 w-24">MRP *</th>
                  <th className="px-2 py-3 w-24">Selling *</th>
                  <th className="px-2 py-3 w-24">Stock *</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v: any, index: number) => (
                  <tr key={v.id} className="border-b dark:border-gray-800">
                    <td className="px-1 py-2">
                      <select className="flex h-9 w-24 rounded-md border border-input bg-background px-3 py-1 text-xs" value={v.colorId} onChange={e => { const nv = [...variants]; nv[index].colorId = e.target.value; setVariants(nv); }}>
                        <option value="">-</option>
                        {colors.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td className="px-1 py-2">
                      <select className="flex h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-xs" value={v.sizeId} onChange={e => { const nv = [...variants]; nv[index].sizeId = e.target.value; setVariants(nv); }}>
                        <option value="">-</option>
                        {sizes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </td>
                    <td className="px-1 py-2"><Input className="h-9 min-w-[100px] text-xs" required value={v.sku} onChange={e => { const nv = [...variants]; nv[index].sku = e.target.value; setVariants(nv); }} /></td>
                    <td className="px-1 py-2"><Input className="h-9 min-w-[100px] text-xs" value={v.barcode} onChange={e => { const nv = [...variants]; nv[index].barcode = e.target.value; setVariants(nv); }} /></td>
                    <td className="px-1 py-2"><Input className="h-9 w-20 text-xs px-2" required type="number" step="0.01" min="0" value={v.purchasePrice} onChange={e => { const nv = [...variants]; nv[index].purchasePrice = e.target.value; setVariants(nv); }} /></td>
                    <td className="px-1 py-2"><Input className="h-9 w-20 text-xs px-2" required type="number" step="0.01" min="0" value={v.mrp} onChange={e => { const nv = [...variants]; nv[index].mrp = e.target.value; setVariants(nv); }} /></td>
                    <td className="px-1 py-2"><Input className="h-9 w-20 text-xs px-2" required type="number" step="0.01" min="0" value={v.sellingPrice} onChange={e => { const nv = [...variants]; nv[index].sellingPrice = e.target.value; setVariants(nv); }} /></td>
                    <td className="px-1 py-2"><Input className="h-9 w-20 text-xs px-2" required type="number" step="1" min="0" value={v.stock} onChange={e => { const nv = [...variants]; nv[index].stock = e.target.value; setVariants(nv); }} /></td>
                    <td className="px-1 py-2 text-right">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { if(variants.length > 1) setVariants(variants.filter((va: any) => va.id !== v.id)) }}>
                        <span className="text-xl">×</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Right Column - Organization & Settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold">Organization</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex gap-2">
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Select Category</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <QuickAddDialog title="Add Category" action={createCategory} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <div className="flex gap-2">
                  <select name="brandId" value={formData.brandId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Select Brand</option>
                    {brands.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <QuickAddDialog title="Add Brand" action={createBrand} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  <select name="colorId" value={formData.colorId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Select Color</option>
                    {colors.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <QuickAddDialog 
                    title="Add Color" 
                    action={createColor}
                    extraFields={
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hex Code (Optional)</label>
                        <Input name="hex" type="color" className="h-10 w-full" defaultValue="#000000" />
                      </div>
                    } 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Size</label>
                <div className="flex gap-2">
                  <select name="sizeId" value={formData.sizeId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Select Size</option>
                    {sizes.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <QuickAddDialog title="Add Size" action={createSize} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <select name="unit" value={formData.unit} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="Piece">Piece</option>
                  <option value="Meter">Meter</option>
                  <option value="Box">Box</option>
                  <option value="Set">Set</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm border dark:border-gray-800 p-6 space-y-6">
            <h2 className="text-lg font-semibold">Tax Information</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Type</label>
                <select name="taxType" value={formData.taxType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">Select Tax</option>
                  <option value="GST">GST</option>
                  <option value="NO_TAX">No Tax</option>
                </select>
              </div>

              {formData.taxType === "GST" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GST Percentage (%)</label>
                    <Input name="gstPercent" type="number" step="0.1" min="0" value={formData.gstPercent} onChange={handleChange} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="taxIncluded" 
                      name="taxIncluded" 
                      checked={formData.taxIncluded} 
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="taxIncluded" className="text-sm font-medium cursor-pointer">
                      Selling Price includes GST
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
