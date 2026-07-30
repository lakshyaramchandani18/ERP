"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Users,
  Receipt,
  Clock,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  Phone,
  Mail,
  FileText,
  Calendar,
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { createSupplier, updateSupplier, deleteSupplier } from "@/actions/suppliers";

export default function SuppliersListClient({
  suppliers,
  stats,
}: {
  suppliers: any[];
  stats: {
    totalSuppliers: number;
    totalPurchaseBillsCount: number;
    totalPurchaseBillsValue: number;
    pendingBillsCount: number;
    totalOutstandingAmount: number;
    paidBillsCount: number;
    totalAmountPaid: number;
    paidThisMonthCount: number;
    paidThisMonthAmount: number;
    dueThisMonthCount: number;
    dueThisMonthAmount: number;
  };
}) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"FOLDERS" | "TABLE">("FOLDERS");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstin: "",
    pan: "",
    address: "",
    creditDays: "30",
    openingBalance: "0",
    notes: "",
  });

  const formatCurrency = (val: number) =>
    `₹${(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    const res = await createSupplier({
      ...form,
      creditDays: parseInt(form.creditDays) || 30,
      openingBalance: parseFloat(form.openingBalance) || 0,
    });
    if (res.success) {
      setShowAddModal(false);
      setForm({
        name: "",
        companyName: "",
        contactPerson: "",
        phone: "",
        email: "",
        gstin: "",
        pan: "",
        address: "",
        creditDays: "30",
        openingBalance: "0",
        notes: "",
      });
      alert("Supplier added successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to add supplier");
    }
    setLoading(false);
  };

  const handleOpenEdit = (sup: any) => {
    setEditingSupplier(sup);
    setForm({
      name: sup.name || "",
      companyName: sup.companyName || "",
      contactPerson: sup.contactPerson || "",
      phone: sup.phone || "",
      email: sup.email || "",
      gstin: sup.gstin || "",
      pan: sup.pan || "",
      address: sup.address || "",
      creditDays: String(sup.creditDays || 30),
      openingBalance: String(sup.openingBalance || 0),
      notes: sup.notes || "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier || !form.name.trim()) return;
    setLoading(true);
    const res = await updateSupplier(editingSupplier.id, {
      ...form,
      creditDays: parseInt(form.creditDays) || 30,
      openingBalance: parseFloat(form.openingBalance) || 0,
    });
    if (res.success) {
      setShowEditModal(false);
      setEditingSupplier(null);
      alert("Supplier updated successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to update supplier");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete supplier "${name}"?`)) return;
    const res = await deleteSupplier(id);
    if (res.success) {
      alert("Supplier deleted successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to delete supplier");
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.companyName?.toLowerCase().includes(term) ||
      s.contactPerson?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.gstin?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold border border-blue-400/30 mb-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>Supplier & Vendor Accounts Command Center</span>
          </div>
          <h2 className="text-2xl font-bold">Supplier Management</h2>
          <p className="text-xs text-slate-300">
            Dedicated vendor workspaces, purchase bills tracking, automated credit ledger, and payments
          </p>
        </div>

        <Button
          onClick={() => {
            setForm({
              name: "",
              companyName: "",
              contactPerson: "",
              phone: "",
              email: "",
              gstin: "",
              pan: "",
              address: "",
              creditDays: "30",
              openingBalance: "0",
              notes: "",
            });
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 h-10 px-5 rounded-xl"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add New Supplier
        </Button>
      </div>

      {/* 5 REDESIGNED DASHBOARD KPI CARDS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1 – Total Purchase Bills */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Bills</div>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {stats.totalPurchaseBillsCount || 0}
            </div>
            <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {formatCurrency(stats.totalPurchaseBillsValue || 0)}
            </div>
          </div>
        </div>

        {/* Card 2 – Pending Bills */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Bills</div>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.pendingBillsCount || 0}
            </div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-300 mt-1">
              {formatCurrency(stats.totalOutstandingAmount || 0)}
            </div>
          </div>
        </div>

        {/* Card 3 – Paid Bills */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paid Bills</div>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.paidBillsCount || 0}
            </div>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {formatCurrency(stats.totalAmountPaid || 0)}
            </div>
          </div>
        </div>

        {/* Card 4 – Bills Paid This Month */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">Paid This Month</div>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {stats.paidThisMonthCount || 0} <span className="text-xs font-medium text-gray-500">Bills</span>
            </div>
            <div className="text-sm font-bold text-teal-700 dark:text-teal-300 mt-1">
              {formatCurrency(stats.paidThisMonthAmount || 0)}
            </div>
          </div>
        </div>

        {/* Card 5 – Bills Due This Month */}
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Due This Month</div>
            <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {stats.dueThisMonthCount || 0} <span className="text-xs font-medium text-gray-500">Bills</span>
            </div>
            <div className="text-sm font-bold text-rose-700 dark:text-rose-300 mt-1">
              {formatCurrency(stats.dueThisMonthAmount || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Directory Search & Controls Bar */}
      <div className="bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers by name, company, contact person, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-900 text-xs rounded-xl h-10"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs text-muted-foreground font-semibold">
            Showing {filteredSuppliers.length} supplier folders
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setViewMode("FOLDERS")}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                viewMode === "FOLDERS"
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden md:inline">Folders</span>
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                viewMode === "TABLE"
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List className="h-4 w-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: SUPPLIER DIRECTORY FOLDER CARDS */}
      {viewMode === "FOLDERS" ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredSuppliers.map((s) => {
            const hasOutstanding = (s.outstanding || 0) > 0;
            return (
              <div
                key={s.id}
                className="group relative bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                {/* Folder Top Tab Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-t-3xl" />

                <div>
                  {/* Folder Header */}
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 border border-amber-300/40 flex items-center justify-center text-2xl font-bold shadow-sm group-hover:scale-105 transition-transform">
                        📁
                      </div>
                      <div>
                        <Link
                          href={`/dashboard/suppliers/${s.id}`}
                          className="font-extrabold text-base text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {s.name}
                        </Link>
                        {s.companyName && (
                          <div className="text-xs text-muted-foreground font-medium line-clamp-1">
                            {s.companyName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Supplier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Supplier Details */}
                  <div className="mt-4 space-y-2 text-xs">
                    {s.contactPerson && (
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{s.contactPerson}</span>
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-mono">{s.phone}</span>
                      </div>
                    )}
                    {s.gstin && (
                      <div className="flex items-center space-x-2 text-gray-500 font-mono text-[11px]">
                        <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span>GST: {s.gstin}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metrics & Workspace Button */}
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Outstanding
                      </div>
                      <div
                        className={`text-base font-black ${
                          hasOutstanding ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"
                        }`}
                      >
                        {formatCurrency(s.outstanding)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Credit Terms
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {s.creditDays || 30} Days
                      </div>
                    </div>
                  </div>

                  <Link href={`/dashboard/suppliers/${s.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all h-9 rounded-xl"
                    >
                      <span className="flex items-center space-x-1.5">
                        <FolderOpen className="h-4 w-4 text-blue-500 group-hover:text-white" />
                        <span>Open Workspace</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}

          {filteredSuppliers.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white dark:bg-gray-950 rounded-3xl border border-dashed border-gray-300 text-muted-foreground space-y-3">
              <Folder className="h-12 w-12 mx-auto text-gray-300" />
              <div className="font-semibold">No suppliers found</div>
              <p className="text-xs">Click "Add New Supplier" to create your first vendor folder workspace.</p>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW ALTERNATIVE */
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="font-bold">Supplier Workspace</TableHead>
                <TableHead className="font-bold">Company / Contact</TableHead>
                <TableHead className="font-bold">Phone</TableHead>
                <TableHead className="font-bold">GSTIN</TableHead>
                <TableHead className="font-bold">Credit Days</TableHead>
                <TableHead className="font-bold text-right">Outstanding</TableHead>
                <TableHead className="font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                    <Link
                      href={`/dashboard/suppliers/${s.id}`}
                      className="hover:text-blue-600 flex items-center space-x-2"
                    >
                      <span className="text-lg">📁</span>
                      <span>{s.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-semibold">{s.companyName || "-"}</div>
                    <div className="text-muted-foreground">{s.contactPerson || ""}</div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{s.phone || "-"}</TableCell>
                  <TableCell className="text-xs font-mono">{s.gstin || "-"}</TableCell>
                  <TableCell className="text-xs font-medium">{s.creditDays || 30} Days</TableCell>
                  <TableCell className="text-right font-extrabold text-amber-600 text-sm">
                    {formatCurrency(s.outstanding || 0)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Link href={`/dashboard/suppliers/${s.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-xs text-blue-600 border-blue-200">
                        Open Workspace
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(s)}
                      className="h-8 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(s.id, s.name)}
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

      {/* Add Supplier Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-blue-600 font-extrabold text-lg">
              <Building2 className="h-5 w-5" />
              <span>Add New Supplier Profile</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Supplier Name <span className="text-red-500">*</span></label>
                <Input
                  placeholder="e.g. VTex Fabrics"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Company Name</label>
                <Input
                  placeholder="e.g. VTex Textiles Pvt Ltd"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Contact Person</label>
                <Input
                  placeholder="e.g. Rajesh Kumar"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Phone Number</label>
                <Input
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Email Address</label>
                <Input
                  placeholder="vendor@vtex.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">GSTIN</label>
                <Input
                  placeholder="27AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">PAN Card</label>
                <Input
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChange={(e) => setForm({ ...form, pan: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Credit Days</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={form.creditDays}
                  onChange={(e) => setForm({ ...form, creditDays: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Opening Balance (₹)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.openingBalance}
                  onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Office Address</label>
              <Textarea
                placeholder="Full address details..."
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10">
              {loading ? "Saving..." : "Create Supplier Workspace"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-blue-600 font-extrabold text-lg">
              <Edit className="h-5 w-5" />
              <span>Edit Supplier Workspace ({editingSupplier?.name})</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Supplier Name <span className="text-red-500">*</span></label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Company Name</label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Contact Person</label>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Phone Number</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Email Address</label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">GSTIN</label>
                <Input
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">PAN Card</label>
                <Input
                  value={form.pan}
                  onChange={(e) => setForm({ ...form, pan: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Credit Days</label>
                <Input
                  type="number"
                  value={form.creditDays}
                  onChange={(e) => setForm({ ...form, creditDays: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Opening Balance (₹)</label>
                <Input
                  type="number"
                  value={form.openingBalance}
                  onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Address</label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10">
              {loading ? "Updating..." : "Update Supplier Profile"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
