"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Tags, Plus, Edit, Trash2, Power, CheckCircle, Sparkles } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/actions/master-data";

export default function CategoriesBrandsClient({
  categories,
  brands,
}: {
  categories: any[];
  brands: any[];
}) {
  const [activeTab, setActiveTab] = useState<"CATEGORIES" | "BRANDS">("CATEGORIES");

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Subcategory Modal State
  const [showSubcatModal, setShowSubcatModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subcatName, setSubcatName] = useState("");

  // Brand Modal State
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandCode, setBrandCode] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createCategory({ name: catName, description: catDesc });
    if (res.success) {
      setShowCategoryModal(false);
      setCatName("");
      setCatDesc("");
      window.location.reload();
    } else {
      alert(res.error || "Failed to create category");
    }
    setLoading(false);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createSubcategory({ categoryId: selectedCatId, name: subcatName });
    if (res.success) {
      setShowSubcatModal(false);
      setSubcatName("");
      window.location.reload();
    } else {
      alert(res.error || "Failed to create subcategory");
    }
    setLoading(false);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createBrand({ name: brandName, code: brandCode });
    if (res.success) {
      setShowBrandModal(false);
      setBrandName("");
      setBrandCode("");
      window.location.reload();
    } else {
      alert(res.error || "Failed to create brand");
    }
    setLoading(false);
  };

  const handleToggleCategoryActive = async (category: any) => {
    const res = await updateCategory({ id: category.id, isActive: !category.isActive });
    if (res.success) window.location.reload();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const res = await deleteCategory(id);
    if (res.success) window.location.reload();
  };

  const handleToggleBrandActive = async (brand: any) => {
    const res = await updateBrand({ id: brand.id, isActive: !brand.isActive });
    if (res.success) window.location.reload();
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    const res = await deleteBrand(id);
    if (res.success) window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-gray-800 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold border border-blue-400/30 mb-2">
            <Layers className="h-3.5 w-3.5" />
            <span>Unified Master Data Management</span>
          </div>
          <h2 className="text-2xl font-bold">Category & Brand Management</h2>
          <p className="text-xs text-slate-300">
            Manage product categories, subcategories, and clothing brands in one single place
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {activeTab === "CATEGORIES" ? (
            <Button
              onClick={() => setShowCategoryModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Category
            </Button>
          ) : (
            <Button
              onClick={() => setShowBrandModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Brand
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab("CATEGORIES")}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "CATEGORIES"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Categories & Subcategories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("BRANDS")}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "BRANDS"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <Tags className="h-4 w-4" />
          <span>Brands ({brands.length})</span>
        </button>
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === "CATEGORIES" && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="font-bold">Category Name</TableHead>
                <TableHead className="font-bold">Subcategories</TableHead>
                <TableHead className="font-bold">Description</TableHead>
                <TableHead className="font-bold text-center">Status</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                    {cat.name}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {cat.subcategories?.map((sub: any) => (
                        <span
                          key={sub.id}
                          className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold text-[11px]"
                        >
                          {sub.name}
                        </span>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedCatId(cat.id);
                          setShowSubcatModal(true);
                        }}
                        className="text-[11px] text-blue-600 font-bold hover:underline ml-1"
                      >
                        + Add Sub
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {cat.description || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {cat.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCategoryActive(cat)}
                      className="h-8 text-xs text-amber-600 hover:bg-amber-50"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="h-8 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* BRANDS TAB */}
      {activeTab === "BRANDS" && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="font-bold">Brand Name</TableHead>
                <TableHead className="font-bold">Brand Code</TableHead>
                <TableHead className="font-bold text-center">Status</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                    {b.name}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-500">
                    {b.code || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        b.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {b.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleBrandActive(b)}
                      className="h-8 text-xs text-amber-600 hover:bg-amber-50"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBrand(b.id)}
                      className="h-8 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Category Name <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. Men's Wear, Sarees, Accessories"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Description</label>
              <Input
                placeholder="Category description..."
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white">
              Save Category
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Modal */}
      <Dialog open={showSubcatModal} onOpenChange={setShowSubcatModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSubcategory} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Subcategory Name <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. Shirts, Jeans, Kurtis"
                value={subcatName}
                onChange={(e) => setSubcatName(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white">
              Save Subcategory
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Brand Modal */}
      <Dialog open={showBrandModal} onOpenChange={setShowBrandModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveBrand} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Brand Name <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. Raymond, Manyavar, Peter England"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Brand Code / SKU Prefix</label>
              <Input
                placeholder="e.g. RAY, MNY"
                value={brandCode}
                onChange={(e) => setBrandCode(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white">
              Save Brand
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
