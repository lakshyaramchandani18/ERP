"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuickAddDialog({
  title,
  action,
  extraFields,
}: {
  title: string;
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  extraFields?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;
    
    const inputs = containerRef.current.querySelectorAll('input');
    const fd = new FormData();
    let hasName = false;
    
    inputs.forEach(input => {
      fd.append(input.name, input.value);
      if (input.name === 'name' && input.value.trim()) hasName = true;
    });

    if (!hasName) {
      alert("Name is required");
      return;
    }

    setLoading(true);
    const result = await action(fd);
    setLoading(false);
    
    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <>
      <Button variant="outline" size="icon" type="button" className="h-10 w-10 shrink-0" onClick={(e) => { e.preventDefault(); setIsOpen(true); }}>
        <Plus className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-xl w-full max-w-md border dark:border-gray-800">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div ref={containerRef} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" required />
              </div>
              
              {extraFields}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
