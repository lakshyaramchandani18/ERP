"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Phone,
  Mail,
  FileText,
  CreditCard,
  DollarSign,
  AlertCircle,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Receipt,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Tag,
} from "lucide-react";
import {
  createSupplierBill,
  editSupplierBill,
  deleteSupplierBill,
  paySupplierBill,
  updateSupplier,
} from "@/actions/suppliers";

export default function SupplierAccountClient({
  supplier,
  upcomingBills,
  overdueBills,
  ledger,
}: {
  supplier: any;
  upcomingBills: any[];
  overdueBills: any[];
  ledger: any[];
}) {
  const [activeTab, setActiveTab] = useState<"BILLS" | "LEDGER" | "PAYMENTS" | "RETURNS" | "INFO">("BILLS");
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showEditBillModal, setShowEditBillModal] = useState(false);
  const [editingBill, setEditingBill] = useState<any | null>(null);
  const [showViewBillModal, setShowViewBillModal] = useState(false);
  const [viewingBill, setViewingBill] = useState<any | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filters for Purchase Bills
  const [billSearch, setBillSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  // Supplier Form
  const [supForm, setSupForm] = useState({
    name: supplier.name || "",
    companyName: supplier.companyName || "",
    contactPerson: supplier.contactPerson || "",
    phone: supplier.phone || "",
    email: supplier.email || "",
    gstin: supplier.gstin || "",
    pan: supplier.pan || "",
    address: supplier.address || "",
    creditDays: String(supplier.creditDays || 30),
    openingBalance: String(supplier.openingBalance || 0),
    notes: supplier.notes || "",
  });

  // Bill Form
  const [billForm, setBillForm] = useState({
    billNumber: "",
    invoiceNumber: "",
    amount: "",
    billDate: new Date().toISOString().split("T")[0],
    creditDays: String(supplier.creditDays || 30),
    dueDate: "",
    notes: "",
  });

  // Payment Form
  const [payForm, setPayForm] = useState({
    amount: "",
    paymentMethod: "BANK",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNo: "",
    notes: "",
  });

  const formatCurrency = (val: number) =>
    `₹${(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateSupplier(supplier.id, {
      ...supForm,
      creditDays: parseInt(supForm.creditDays) || 30,
      openingBalance: parseFloat(supForm.openingBalance) || 0,
    });
    if (res.success) {
      setShowEditSupplierModal(false);
      alert("Supplier information updated!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to update supplier");
    }
    setLoading(false);
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billForm.billNumber || !billForm.amount) return;
    setLoading(true);

    const res = await createSupplierBill({
      supplierId: supplier.id,
      billNumber: billForm.billNumber,
      invoiceNumber: billForm.invoiceNumber,
      amount: billForm.amount,
      billDate: billForm.billDate,
      creditDays: billForm.creditDays,
      dueDate: billForm.dueDate || undefined,
      notes: billForm.notes,
    });

    if (res.success) {
      setShowAddBillModal(false);
      setBillForm({
        billNumber: "",
        invoiceNumber: "",
        amount: "",
        billDate: new Date().toISOString().split("T")[0],
        creditDays: String(supplier.creditDays || 30),
        dueDate: "",
        notes: "",
      });
      alert("Purchase Bill created and added to ledger & payables!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to create bill");
    }
    setLoading(false);
  };

  const handleEditBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;
    setLoading(true);

    const res = await editSupplierBill(editingBill.id, {
      billNumber: billForm.billNumber,
      invoiceNumber: billForm.invoiceNumber,
      amount: billForm.amount,
      billDate: billForm.billDate,
      creditDays: billForm.creditDays,
      dueDate: billForm.dueDate || undefined,
      notes: billForm.notes,
    });

    if (res.success) {
      setShowEditBillModal(false);
      setEditingBill(null);
      alert("Purchase Bill updated successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to update bill");
    }
    setLoading(false);
  };

  const handleDeleteBillClick = async (billId: string, billNum: string) => {
    if (!confirm(`Are you sure you want to delete Purchase Bill #${billNum}?`)) return;
    setLoading(true);
    const res = await deleteSupplierBill(billId);
    if (res.success) {
      alert("Purchase Bill deleted successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to delete bill");
    }
    setLoading(false);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.amount) return;
    setLoading(true);

    const res = await paySupplierBill({
      supplierId: supplier.id,
      billId: selectedBill?.id,
      amount: payForm.amount,
      paymentMethod: payForm.paymentMethod,
      paymentDate: payForm.paymentDate,
      referenceNo: payForm.referenceNo,
      notes: payForm.notes,
    });

    if (res.success) {
      setShowPayModal(false);
      setSelectedBill(null);
      setPayForm({
        amount: "",
        paymentMethod: "BANK",
        paymentDate: new Date().toISOString().split("T")[0],
        referenceNo: "",
        notes: "",
      });
      alert("Supplier Payment logged! Auto-synced with Business Expenses & Cash Flow.");
      window.location.reload();
    } else {
      alert(res.error || "Failed to process payment");
    }
    setLoading(false);
  };

  const openPayModalForBill = (bill: any) => {
    setSelectedBill(bill);
    setPayForm({
      ...payForm,
      amount: String(bill.remainingAmount),
    });
    setShowPayModal(true);
  };

  const openEditBillModal = (bill: any) => {
    setEditingBill(bill);
    setBillForm({
      billNumber: bill.billNumber || "",
      invoiceNumber: bill.invoiceNumber || "",
      amount: String(bill.amount || 0),
      billDate: bill.billDate ? new Date(bill.billDate).toISOString().split("T")[0] : "",
      creditDays: String(bill.creditDays || supplier.creditDays || 30),
      dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split("T")[0] : "",
      notes: bill.notes || "",
    });
    setShowEditBillModal(true);
  };

  // Filter Purchase Bills
  const filteredBills = (supplier.supplierBills || []).filter((b: any) => {
    const term = billSearch.toLowerCase();
    const matchesSearch =
      !term ||
      b.billNumber.toLowerCase().includes(term) ||
      (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(term)) ||
      (b.notes && b.notes.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "OVERDUE" ? b.status === "OVERDUE" : b.status === statusFilter);

    const bDate = new Date(b.billDate);
    const matchesMonth = monthFilter === "ALL" || bDate.getMonth() === parseInt(monthFilter);
    const matchesYear = yearFilter === "ALL" || bDate.getFullYear() === parseInt(yearFilter);

    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Back Link & Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/suppliers"
          className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Supplier Directory</span>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditSupplierModal(true)}
          className="text-xs font-bold text-gray-700 dark:text-gray-300 border-gray-300"
        >
          <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit Supplier Profile
        </Button>
      </div>

      {/* SECTION 3: SUPPLIER PROFILE WORKSPACE HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-14 w-14 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold text-2xl shadow-inner">
              📁
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-black">{supplier.name}</h1>
                <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-blue-400/30">
                  Workspace
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {supplier.companyName || "Vendor Account"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Person</span>
              <span className="font-semibold text-white">{supplier.contactPerson || "-"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
              <span className="font-mono text-white">{supplier.phone || "-"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">GST Number</span>
              <span className="font-mono text-white">{supplier.gstin || "-"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Credit Days</span>
              <span className="font-semibold text-white">{supplier.creditDays || 30} Days</span>
            </div>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center min-w-[150px]">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Opening Balance</div>
            <div className="text-xl font-extrabold text-slate-200 mt-1">
              {formatCurrency(supplier.openingBalance || 0)}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center min-w-[170px]">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Current Outstanding</div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {formatCurrency(supplier.outstanding || 0)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setSelectedBill(null);
                setPayForm({
                  amount: String(supplier.outstanding || 0),
                  paymentMethod: "BANK",
                  paymentDate: new Date().toISOString().split("T")[0],
                  referenceNo: "",
                  notes: "",
                });
                setShowPayModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 h-10 px-4 rounded-xl"
            >
              <CreditCard className="mr-1.5 h-4 w-4" /> Pay Supplier
            </Button>

            <Button
              onClick={() => setShowAddBillModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 h-10 px-4 rounded-xl"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add Purchase Bill
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 7: CREDIT OVERDUE ALERTS */}
      {overdueBills && overdueBills.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300 shadow-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-extrabold text-sm text-rose-900 dark:text-rose-200">
                OVERDUE BILLS ALERT! ({overdueBills.length} Bill{overdueBills.length > 1 ? "s" : ""})
              </span>
              <p className="mt-0.5 text-rose-700 dark:text-rose-400">
                Total Overdue Amount:{" "}
                <strong className="font-black text-rose-900 dark:text-rose-100">
                  {formatCurrency(overdueBills.reduce((s, b) => s + b.remainingAmount, 0))}
                </strong>
                . Credit terms passed!
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => openPayModalForBill(overdueBills[0])}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 px-4 rounded-xl flex-shrink-0"
          >
            Clear Overdue Bill
          </Button>
        </div>
      )}

      {/* WORKSPACE SUB-TABS */}
      <div className="flex flex-wrap items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab("BILLS")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "BILLS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Purchase Bills ({supplier.supplierBills?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("LEDGER")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "LEDGER"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Supplier Ledger ({ledger?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("PAYMENTS")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "PAYMENTS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payment History ({supplier.supplierPayments?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("RETURNS")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "RETURNS"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Purchase Returns ({supplier.purchaseReturns?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("INFO")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "INFO"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Supplier Info</span>
        </button>
      </div>

      {/* SECTION 4: PURCHASE BILLS WORKSPACE */}
      {activeTab === "BILLS" && (
        <div className="space-y-4">
          {/* Controls & Filters Bar */}
          <div className="bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bill #, invoice #, remarks..."
                value={billSearch}
                onChange={(e) => setBillSearch(e.target.value)}
                className="pl-9 bg-gray-50 dark:bg-gray-900 text-xs h-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "ALL")}>
                <SelectTrigger className="w-[130px] text-xs h-9 bg-gray-50 dark:bg-gray-900">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="UNPAID">Pending / Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PAID">Fully Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select value={monthFilter} onValueChange={(val) => setMonthFilter(val || "ALL")}>
                <SelectTrigger className="w-[120px] text-xs h-9 bg-gray-50 dark:bg-gray-900">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Months</SelectItem>
                  <SelectItem value="0">Jan</SelectItem>
                  <SelectItem value="1">Feb</SelectItem>
                  <SelectItem value="2">Mar</SelectItem>
                  <SelectItem value="3">Apr</SelectItem>
                  <SelectItem value="4">May</SelectItem>
                  <SelectItem value="5">Jun</SelectItem>
                  <SelectItem value="6">Jul</SelectItem>
                  <SelectItem value="7">Aug</SelectItem>
                  <SelectItem value="8">Sep</SelectItem>
                  <SelectItem value="9">Oct</SelectItem>
                  <SelectItem value="10">Nov</SelectItem>
                  <SelectItem value="11">Dec</SelectItem>
                </SelectContent>
              </Select>

              {/* Year Filter */}
              <Select value={yearFilter} onValueChange={(val) => setYearFilter(val || "ALL")}>
                <SelectTrigger className="w-[110px] text-xs h-9 bg-gray-50 dark:bg-gray-900">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Years</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setShowAddBillModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Bill
              </Button>
            </div>
          </div>

          {/* Bills Table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow>
                  <TableHead className="font-bold">Bill #</TableHead>
                  <TableHead className="font-bold">Invoice #</TableHead>
                  <TableHead className="font-bold">Bill Date</TableHead>
                  <TableHead className="font-bold">Due Date</TableHead>
                  <TableHead className="font-bold text-right">Bill Amount</TableHead>
                  <TableHead className="font-bold text-right">Paid</TableHead>
                  <TableHead className="font-bold text-right">Outstanding</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((b: any) => {
                  const isOverdue = b.status === "OVERDUE" || (b.status !== "PAID" && new Date(b.dueDate) < new Date());
                  return (
                    <TableRow key={b.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                        #{b.billNumber}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-gray-600 dark:text-gray-400">
                        {b.invoiceNumber || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(b.billDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        <span className={isOverdue ? "text-red-600 font-extrabold" : "text-gray-700 dark:text-gray-300"}>
                          {new Date(b.dueDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(b.amount)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 text-xs">
                        {formatCurrency(b.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right font-black text-amber-600 text-xs">
                        {formatCurrency(b.remainingAmount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-block text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full ${
                            b.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : isOverdue
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {isOverdue ? "OVERDUE" : b.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setViewingBill(b);
                            setShowViewBillModal(true);
                          }}
                          className="h-8 text-xs text-gray-600 hover:bg-gray-100"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditBillModal(b)}
                          className="h-8 text-xs text-blue-600 hover:bg-blue-50"
                          title="Edit Bill"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {b.status !== "PAID" && (
                          <Button
                            size="sm"
                            onClick={() => openPayModalForBill(b)}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Pay
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBillClick(b.id, b.billNumber)}
                          className="h-8 text-xs text-red-600 hover:bg-red-50"
                          title="Delete Bill"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredBills.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No purchase bills found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* SECTION 5: DEDICATED SUPPLIER LEDGER */}
      {activeTab === "LEDGER" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                Supplier Account Ledger Statement
              </h3>
              <p className="text-xs text-muted-foreground">
                Automatic ledger tracking for Opening Balance, Purchase Bills (+), Payments (-), and Returns (-)
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Closing Balance</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(supplier.outstanding)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Transaction Type</TableHead>
                  <TableHead className="font-bold">Reference</TableHead>
                  <TableHead className="font-bold">Remarks</TableHead>
                  <TableHead className="font-bold text-right">Debit (-)</TableHead>
                  <TableHead className="font-bold text-right">Credit (+)</TableHead>
                  <TableHead className="font-bold text-right">Outstanding Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger && ledger.map((row: any) => (
                  <TableRow key={row.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {new Date(row.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                          row.type === "OPENING_BALANCE"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            : row.type === "PURCHASE_BILL"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : row.type === "PAYMENT"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                        }`}
                      >
                        {row.type.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-semibold">{row.reference}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.remarks}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 text-xs">
                      {row.isDebit ? `- ${formatCurrency(row.amount)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-600 text-xs">
                      {row.isCredit ? `+ ${formatCurrency(row.amount)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-black text-gray-900 dark:text-gray-100 text-sm">
                      {formatCurrency(row.runningBalance)}
                    </TableCell>
                  </TableRow>
                ))}

                {(!ledger || ledger.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No ledger transactions logged yet for this supplier.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* SECTION 6: PAYMENT MANAGEMENT HISTORY */}
      {activeTab === "PAYMENTS" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-gray-950 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div>
              <h3 className="font-extrabold text-base">Payment History</h3>
              <p className="text-xs text-muted-foreground">
                All full & partial payments recorded for {supplier.name}
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedBill(null);
                setPayForm({
                  amount: String(supplier.outstanding || 0),
                  paymentMethod: "BANK",
                  paymentDate: new Date().toISOString().split("T")[0],
                  referenceNo: "",
                  notes: "",
                });
                setShowPayModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              <CreditCard className="mr-1.5 h-4 w-4" /> Log New Payment
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow>
                  <TableHead className="font-bold">Payment Date</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold">Reference / UTR</TableHead>
                  <TableHead className="font-bold">Notes</TableHead>
                  <TableHead className="font-bold text-right">Amount Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplier.supplierPayments?.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-xs font-semibold">
                      {new Date(p.paymentDate).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs font-bold uppercase text-blue-600">
                      {p.paymentMethod}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-gray-500">
                      {p.referenceNo || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.notes || "-"}</TableCell>
                    <TableCell className="text-right font-black text-emerald-600 text-base">
                      {formatCurrency(p.amount)}
                    </TableCell>
                  </TableRow>
                ))}

                {(!supplier.supplierPayments || supplier.supplierPayments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No payments logged yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 4: PURCHASE RETURNS */}
      {activeTab === "RETURNS" && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="font-bold">Return #</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Reason</TableHead>
                <TableHead className="font-bold text-right">Return Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplier.purchaseReturns?.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-bold">#{r.returnNumber}</TableCell>
                  <TableCell className="text-xs">{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.reason || "Damaged/Defective"}</TableCell>
                  <TableCell className="text-right font-bold text-purple-600">
                    {formatCurrency(r.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
              {(!supplier.purchaseReturns || supplier.purchaseReturns.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    No goods returned to this supplier.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* TAB 5: SUPPLIER DETAILED INFO */}
      {activeTab === "INFO" && (
        <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-extrabold text-lg flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>Full Supplier Profile Information</span>
            </h3>
            <Button
              onClick={() => setShowEditSupplierModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Supplier Name</span>
              <div className="font-bold text-gray-900 dark:text-gray-100">{supplier.name}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Company Name</span>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{supplier.companyName || "-"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Contact Person</span>
              <div className="font-semibold text-gray-800 dark:text-gray-200">{supplier.contactPerson || "-"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Phone Number</span>
              <div className="font-mono text-gray-800 dark:text-gray-200">{supplier.phone || "-"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Email Address</span>
              <div className="font-mono text-gray-800 dark:text-gray-200">{supplier.email || "-"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">GST Number</span>
              <div className="font-mono text-gray-800 dark:text-gray-200">{supplier.gstin || "-"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">PAN Card</span>
              <div className="font-mono text-gray-800 dark:text-gray-200">{supplier.pan || "-"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Credit Days</span>
              <div className="font-bold text-indigo-600">{supplier.creditDays || 30} Days</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Opening Balance</span>
              <div className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(supplier.openingBalance || 0)}</div>
            </div>
            <div className="space-y-1 col-span-full">
              <span className="text-xs font-bold text-gray-400 uppercase">Office Address</span>
              <div className="text-gray-700 dark:text-gray-300">{supplier.address || "-"}</div>
            </div>
            <div className="space-y-1 col-span-full">
              <span className="text-xs font-bold text-gray-400 uppercase">Notes & Remarks</span>
              <div className="text-gray-700 dark:text-gray-300">{supplier.notes || "No notes added."}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Add Purchase Bill */}
      <Dialog open={showAddBillModal} onOpenChange={setShowAddBillModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-blue-600">
              <Receipt className="h-5 w-5" />
              <span>Add Purchase Bill ({supplier.name})</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateBill} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Bill Number <span className="text-red-500">*</span></label>
                <Input
                  placeholder="e.g. BILL-1001"
                  value={billForm.billNumber}
                  onChange={(e) => setBillForm({ ...billForm, billNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Vendor Invoice #</label>
                <Input
                  placeholder="e.g. INV-9988"
                  value={billForm.invoiceNumber}
                  onChange={(e) => setBillForm({ ...billForm, invoiceNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Bill Amount (₹) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 50000"
                  value={billForm.amount}
                  onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Bill Date</label>
                <Input
                  type="date"
                  value={billForm.billDate}
                  onChange={(e) => setBillForm({ ...billForm, billDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Credit Days</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={billForm.creditDays}
                  onChange={(e) => setBillForm({ ...billForm, creditDays: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Due Date (Auto-calculated)</label>
                <Input
                  type="date"
                  value={billForm.dueDate}
                  onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Notes / Remarks</label>
              <Textarea
                placeholder="Bill items or details..."
                value={billForm.notes}
                onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
              {loading ? "Saving..." : "Save Purchase Bill"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Edit Purchase Bill */}
      <Dialog open={showEditBillModal} onOpenChange={setShowEditBillModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-blue-600">
              <Edit className="h-5 w-5" />
              <span>Edit Purchase Bill</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditBillSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Bill Number <span className="text-red-500">*</span></label>
                <Input
                  value={billForm.billNumber}
                  onChange={(e) => setBillForm({ ...billForm, billNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Vendor Invoice #</label>
                <Input
                  value={billForm.invoiceNumber}
                  onChange={(e) => setBillForm({ ...billForm, invoiceNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Bill Amount (₹) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  step="0.01"
                  value={billForm.amount}
                  onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Bill Date</label>
                <Input
                  type="date"
                  value={billForm.billDate}
                  onChange={(e) => setBillForm({ ...billForm, billDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Credit Days</label>
                <Input
                  type="number"
                  value={billForm.creditDays}
                  onChange={(e) => setBillForm({ ...billForm, creditDays: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Due Date</label>
                <Input
                  type="date"
                  value={billForm.dueDate}
                  onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Notes</label>
              <Textarea
                value={billForm.notes}
                onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
              {loading ? "Updating..." : "Update Purchase Bill"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: View Purchase Bill */}
      <Dialog open={showViewBillModal} onOpenChange={setShowViewBillModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-indigo-600 font-bold">
              <Eye className="h-5 w-5" />
              <span>Purchase Bill #{viewingBill?.billNumber}</span>
            </DialogTitle>
          </DialogHeader>

          {viewingBill && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Supplier:</span>
                  <span className="font-bold">{supplier.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Invoice Number:</span>
                  <span className="font-mono">{viewingBill.invoiceNumber || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Bill Date:</span>
                  <span>{new Date(viewingBill.billDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Due Date:</span>
                  <span className="font-bold text-rose-600">{new Date(viewingBill.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-500 font-semibold">Bill Amount:</span>
                  <span className="font-black text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(viewingBill.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(viewingBill.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Remaining Outstanding:</span>
                  <span className="font-black text-amber-600">{formatCurrency(viewingBill.remainingAmount)}</span>
                </div>
              </div>

              {viewingBill.notes && (
                <div className="space-y-1">
                  <span className="font-semibold text-gray-500">Remarks:</span>
                  <p className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border text-gray-700 dark:text-gray-300">
                    {viewingBill.notes}
                  </p>
                </div>
              )}

              {viewingBill.status !== "PAID" && (
                <Button
                  onClick={() => {
                    setShowViewBillModal(false);
                    openPayModalForBill(viewingBill);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Pay This Bill Now
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal 4: Pay Supplier Bill */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-emerald-600 font-bold">
              <CreditCard className="h-5 w-5" />
              <span>Pay Supplier ({supplier.name})</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePaySubmit} className="space-y-4 pt-2">
            {selectedBill && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="font-bold text-emerald-900 dark:text-emerald-300">
                  Bill #{selectedBill.billNumber}
                </div>
                <div className="flex justify-between mt-1 text-emerald-700 dark:text-emerald-400">
                  <span>Total Bill: {formatCurrency(selectedBill.amount)}</span>
                  <span>Remaining: {formatCurrency(selectedBill.remainingAmount)}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Payment Amount (₹) <span className="text-red-500">*</span></label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 20000"
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Payment Method</label>
                <Select
                  value={payForm.paymentMethod}
                  onValueChange={(val) => setPayForm({ ...payForm, paymentMethod: val || "BANK" })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Transfer / NEFT</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Payment Date</label>
                <Input
                  type="date"
                  value={payForm.paymentDate}
                  onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Reference No / Txn ID</label>
              <Input
                placeholder="e.g. UTR99887766"
                value={payForm.referenceNo}
                onChange={(e) => setPayForm({ ...payForm, referenceNo: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>ERP Sync:</strong> Reduces supplier balance, auto-creates Business Expense, updates Cash Flow & Accounting Payables.
              </span>
            </div>

            <Button type="submit" disabled={loading || !payForm.amount} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {loading ? "Processing..." : "Complete Payment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 5: Edit Supplier Profile */}
      <Dialog open={showEditSupplierModal} onOpenChange={setShowEditSupplierModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-blue-600 font-bold">
              <Edit className="h-5 w-5" />
              <span>Edit Supplier Profile</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateSupplier} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Supplier Name <span className="text-red-500">*</span></label>
                <Input
                  value={supForm.name}
                  onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Company Name</label>
                <Input
                  value={supForm.companyName}
                  onChange={(e) => setSupForm({ ...supForm, companyName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Contact Person</label>
                <Input
                  value={supForm.contactPerson}
                  onChange={(e) => setSupForm({ ...supForm, contactPerson: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Phone Number</label>
                <Input
                  value={supForm.phone}
                  onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Email Address</label>
                <Input
                  value={supForm.email}
                  onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">GSTIN</label>
                <Input
                  value={supForm.gstin}
                  onChange={(e) => setSupForm({ ...supForm, gstin: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">PAN Card</label>
                <Input
                  value={supForm.pan}
                  onChange={(e) => setSupForm({ ...supForm, pan: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Credit Days</label>
                <Input
                  type="number"
                  value={supForm.creditDays}
                  onChange={(e) => setSupForm({ ...supForm, creditDays: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Opening Balance (₹)</label>
                <Input
                  type="number"
                  value={supForm.openingBalance}
                  onChange={(e) => setSupForm({ ...supForm, openingBalance: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Office Address</label>
              <Textarea
                value={supForm.address}
                onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
              {loading ? "Updating..." : "Update Supplier"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
