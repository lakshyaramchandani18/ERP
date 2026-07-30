"use client";
import { useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { columns, InventoryItem } from "./columns";
import { Download, Upload, Plus, FileSpreadsheet, FileText, TableProperties } from "lucide-react";
import Link from "next/link";
import * as xlsx from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function StockClient({ data, brands, categories }: { data: InventoryItem[], brands: any[], categories: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log("CSV Parsed:", results.data);
          alert(`Successfully parsed ${results.data.length} rows from CSV. Backend sync pending.`);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsData = xlsx.utils.sheet_to_json(ws);
        console.log("Excel Parsed:", jsData);
        alert(`Successfully parsed ${jsData.length} rows from Excel. Backend sync pending.`);
      };
      reader.readAsBinaryString(file);
    }
    // reset input
    e.target.value = '';
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Search term match (Name, SKU, Barcode, HSN)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower) ||
        (item.barcode && item.barcode.toLowerCase().includes(searchLower)) ||
        (item.hsnCode && item.hsnCode.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // 2. Filters
      if (selectedBrand && item.brand !== selectedBrand) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedStatus && item.status !== selectedStatus) return false;
      
      if (selectedStock === "out") {
        if (item.stock > 0) return false;
      } else if (selectedStock === "low") {
        if (item.stock <= 0 || item.stock >= 5) return false;
      } else if (selectedStock === "in") {
        if (item.stock < 5) return false;
      }

      return true;
    });
  }, [data, searchTerm, selectedBrand, selectedCategory, selectedStatus, selectedStock]);

  const exportExcel = () => {
    const ws = xlsx.utils.json_to_sheet(filteredData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Inventory");
    xlsx.writeFile(wb, "Inventory_Backup.xlsx");
  };

  const exportCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Inventory_Backup.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Master Inventory List", 14, 15);
    
    const tableData = filteredData.map(row => [
      row.name, row.sku, row.category, row.brand || "-", row.stock, row.sellingPrice, row.status
    ]);
    
    autoTable(doc, {
      head: [['Product Name', 'SKU', 'Category', 'Brand', 'Stock', 'Selling Price', 'Status']],
      body: tableData,
      startY: 20,
    });
    
    doc.save("Inventory_Backup.pdf");
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Inventory List</h1>
          <p className="text-sm text-muted-foreground">
            View, search, and manage all product variants across your business.
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import CSV/Excel
          </Button>
          <Button variant="outline" onClick={exportExcel} className="gap-2 text-green-700">
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <FileText className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" onClick={exportPDF} className="gap-2 text-red-600">
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Link href="/dashboard/products/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border dark:border-gray-800 shadow-sm space-y-6 flex-1">
        
        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input 
              placeholder="Search by Name, SKU, Barcode, HSN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>

          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            <option value="">All Stock Status</option>
            <option value="in">In Stock (Healthy)</option>
            <option value="low">Low Stock (&lt; 5)</option>
            <option value="out">Out of Stock (0)</option>
          </select>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredData} 
          getRowCanExpand={(row: any) => row.original.variants?.length > 1}
          renderSubComponent={({ row }) => (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg m-2 border border-gray-200 dark:border-gray-800 shadow-inner">
              <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Variant Breakdown</h4>
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase border-b dark:border-gray-700">
                  <tr>
                    <th className="py-2">SKU</th>
                    <th className="py-2">Color</th>
                    <th className="py-2">Size</th>
                    <th className="py-2">Barcode</th>
                    <th className="py-2">Selling (₹)</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {row.original.variants.map((v: any) => (
                    <tr key={v.id} className="border-b dark:border-gray-800 last:border-0">
                      <td className="py-2">{v.sku}</td>
                      <td className="py-2">{v.color}</td>
                      <td className="py-2">{v.size}</td>
                      <td className="py-2">{v.barcode || "-"}</td>
                      <td className="py-2">{typeof v.sellingPrice === 'number' ? v.sellingPrice.toFixed(2) : v.sellingPrice}</td>
                      <td className="py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          v.stock <= 0 ? 'bg-red-50 text-red-700' : 
                          v.stock < 5 ? 'bg-yellow-50 text-yellow-800' : 
                          'bg-green-50 text-green-700'
                        }`}>
                          {v.stock}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          v.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        />
      </div>
    </div>
  );
}
