"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createCategory } from "@/actions/master-data";

export function AddCategoryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const result = await createCategory(formData);
    setLoading(false);
    
    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
        <Plus className="mr-2 h-4 w-4" /> Add Category
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-xl w-full max-w-md border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input name="name" required placeholder="e.g. Men's Topwear" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input name="description" placeholder="Brief description..." />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? "Saving..." : "Save Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
