"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign,
  AlertCircle,
  Plus,
  CreditCard,
  Search,
  Edit,
  Trash2,
  Calendar,
  UserCheck,
  History,
  FileText,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { recordUdhaarPayment, createUdhaarEntry, updateUdhaarEntry, deleteUdhaarEntry } from "@/actions/udhaar";

export default function UdhaarClient({
  entries,
  customers,
  stats,
}: {
  entries: any[];
  customers: any[];
  stats: {
    totalOutstandingAmount: number;
    totalCustomersWithUdhaar: number;
    totalCreditBills: number;
    amountCollectedThisMonth: number;
    overdueAmount: number;
    overdueCustomersCount: number;
  };
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PARTIAL" | "PAID" | "OVERDUE">("ALL");

  const [showPayModal, setShowPayModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [historyEntry, setHistoryEntry] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // New Udhaar Form (Auto-calculates Outstanding Amount = Bill Amount - Paid Amount)
  const [createForm, setCreateForm] = useState({
    customerId: "",
    billNumber: "",
    billAmount: "",
    paidAmount: "0",
    dueDate: "",
    notes: "",
  });

  // Edit Udhaar Form
  const [editForm, setEditForm] = useState({
    totalAmount: "",
    dueDate: "",
    notes: "",
  });

  // Payment Form
  const [payForm, setPayForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    referenceNo: "",
    notes: "",
  });

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const calculatedOutstanding = Math.max(
    0,
    (parseFloat(createForm.billAmount) || 0) - (parseFloat(createForm.paidAmount) || 0)
  );

  const handleCreateUdhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.customerId || !createForm.billAmount) return;
    setLoading(true);

    const res = await createUdhaarEntry({
      customerId: createForm.customerId,
      billNumber: createForm.billNumber,
      billAmount: parseFloat(createForm.billAmount),
      paidAmount: parseFloat(createForm.paidAmount || "0"),
      dueDate: createForm.dueDate,
      notes: createForm.notes,
    });

    if (res.success) {
      setShowCreateModal(false);
      setCreateForm({ customerId: "", billNumber: "", billAmount: "", paidAmount: "0", dueDate: "", notes: "" });
      alert("Udhaar record created successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to create Udhaar record");
    }
    setLoading(false);
  };

  const handleOpenEdit = (entry: any) => {
    setEditingEntry(entry);
    setEditForm({
      totalAmount: String(entry.totalAmount),
      dueDate: new Date(entry.dueDate).toISOString().split("T")[0],
      notes: entry.notes || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateUdhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    setLoading(true);
    const res = await updateUdhaarEntry(editingEntry.id, {
      totalAmount: parseFloat(editForm.totalAmount),
      dueDate: editForm.dueDate,
      notes: editForm.notes,
    });

    if (res.success) {
      setShowEditModal(false);
      setEditingEntry(null);
      alert("Udhaar record updated successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to update Udhaar record");
    }
    setLoading(false);
  };

  const handleDeleteUdhaar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Udhaar record?")) return;
    const res = await deleteUdhaarEntry(id);
    if (res.success) {
      alert("Udhaar record deleted successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to delete Udhaar record");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;
    setLoading(true);
    const res = await recordUdhaarPayment({
      udhaarId: selectedEntry.id,
      amount: payForm.amount,
      paymentMethod: payForm.paymentMethod,
      referenceNo: payForm.referenceNo,
      notes: payForm.notes,
    });

    if (res.success) {
      setShowPayModal(false);
      setSelectedEntry(null);
      setPayForm({ amount: "", paymentMethod: "CASH", referenceNo: "", notes: "" });
      alert("Udhaar Payment recorded! Updated Customer Ledger & Cash Flow.");
      window.location.reload();
    } else {
      alert(res.error || "Failed to record payment");
    }
    setLoading(false);
  };

  const filteredEntries = entries.filter((e) => {
    const isOverdue = e.status !== "PAID" && new Date(e.dueDate) < new Date();
    const computedStatus = isOverdue ? "OVERDUE" : e.paidAmount > 0 && e.remainingAmount > 0 ? "PARTIAL" : e.status;

    if (statusFilter !== "ALL") {
      if (statusFilter === "OVERDUE" && !isOverdue) return false;
      if (statusFilter === "PARTIAL" && (e.paidAmount === 0 || e.remainingAmount === 0)) return false;
      if (statusFilter === "PENDING" && (e.paidAmount > 0 || isOverdue || e.status === "PAID")) return false;
      if (statusFilter === "PAID" && e.status !== "PAID") return false;
    }

    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      e.customer?.name.toLowerCase().includes(term) ||
      e.customer?.mobile.includes(term) ||
      e.billNumber?.toLowerCase().includes(term) ||
      e.saleOrder?.invoiceNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-400/30 mb-2">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Customer Udhaar & Credit Management Hub</span>
          </div>
          <h2 className="text-2xl font-bold">Udhaar Management</h2>
          <p className="text-xs text-slate-300">
            Track credit sales, outstanding balances, 30-day due reminders, and payment history
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-500/20"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Udhaar Entry
        </Button>
      </div>

      {/* 6 Udhaar Summary Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-rose-600">Total Outstanding</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(stats.totalOutstandingAmount)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-gray-500">Customers with Udhaar</div>
          <div className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">
            {stats.totalCustomersWithUdhaar}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-indigo-600">Total Credit Bills</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.totalCreditBills}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-emerald-600">Collected This Month</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(stats.amountCollectedThisMonth)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-red-600">Overdue Amount</div>
          <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
            {formatCurrency(stats.overdueAmount)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-red-600">Overdue Customers</div>
          <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
            {stats.overdueCustomersCount}
          </div>
        </div>
      </div>

      {/* Overdue Notification Banner */}
      {stats.overdueCustomersCount > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 shadow-sm animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-sm">⚠️ Overdue Udhaar Alert!</span>
              <p className="mt-0.5 text-rose-700 dark:text-rose-400">
                You have {stats.overdueCustomersCount} customer(s) with overdue credit amounting to {formatCurrency(stats.overdueAmount)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-950 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer name, mobile, bill number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-900 text-xs"
          />
        </div>

        {/* Filters: ALL, PENDING, PARTIAL, PAID, OVERDUE */}
        <div className="flex items-center space-x-1 overflow-x-auto bg-gray-100 dark:bg-gray-900 p-1 rounded-xl text-xs font-semibold">
          {(["ALL", "PENDING", "PARTIAL", "OVERDUE", "PAID"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-xs font-extrabold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Udhaar Register Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead className="font-bold">Customer Name</TableHead>
              <TableHead className="font-bold">Mobile</TableHead>
              <TableHead className="font-bold">Bill Number</TableHead>
              <TableHead className="font-bold">Bill Date</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="font-bold">Bill Amount</TableHead>
              <TableHead className="font-bold">Paid</TableHead>
              <TableHead className="font-bold">Outstanding</TableHead>
              <TableHead className="font-bold text-center">Status</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((e) => {
              const isOverdue = e.status !== "PAID" && new Date(e.dueDate) < new Date();
              return (
                <TableRow
                  key={e.id}
                  className={`hover:bg-gray-50/50 ${
                    isOverdue ? "bg-rose-50/40 dark:bg-rose-950/20" : ""
                  }`}
                >
                  <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                    {e.customer?.name}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-gray-500">
                    {e.customer?.mobile}
                  </TableCell>
                  <TableCell className="text-xs font-mono font-semibold text-indigo-600">
                    {e.billNumber || e.saleOrder?.invoiceNumber || "-"}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <span className={isOverdue ? "text-red-600 font-extrabold" : "text-gray-700 dark:text-gray-300"}>
                      {new Date(e.dueDate).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold">{formatCurrency(e.totalAmount)}</TableCell>
                  <TableCell className="text-emerald-600 font-bold text-xs">
                    {formatCurrency(e.paidAmount)}
                  </TableCell>
                  <TableCell className="text-rose-600 font-black text-xs">
                    {formatCurrency(e.remainingAmount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-block text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                        e.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : isOverdue
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse"
                          : e.paidAmount > 0
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {isOverdue ? "OVERDUE" : e.paidAmount > 0 && e.remainingAmount > 0 ? "PARTIAL" : e.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {e.status !== "PAID" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(e);
                          setPayForm({ amount: String(e.remainingAmount), paymentMethod: "CASH", referenceNo: "", notes: "" });
                          setShowPayModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Receive Payment
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setHistoryEntry(e);
                        setShowHistoryModal(true);
                      }}
                      className="h-8 text-xs text-indigo-600 border-indigo-200"
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(e)}
                      className="h-8 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUdhaar(e.id)}
                      className="h-8 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                  No Udhaar records found for the selected filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Udhaar Entry Modal (Auto Calculates Outstanding Amount) */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-amber-600">
              <DollarSign className="h-5 w-5" />
              <span>Create Customer Udhaar Record</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateUdhaar} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Select Customer <span className="text-red-500">*</span></label>
              <Select
                value={createForm.customerId}
                onValueChange={(val) => setCreateForm({ ...createForm, customerId: val || "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.mobile})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Bill / Invoice Number (Optional)</label>
              <Input
                placeholder="e.g. INV-2026-001"
                value={createForm.billNumber}
                onChange={(e) => setCreateForm({ ...createForm, billNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Total Bill Amount (₹) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="5000"
                  value={createForm.billAmount}
                  onChange={(e) => setCreateForm({ ...createForm, billAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Initial Amount Paid (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1000"
                  value={createForm.paidAmount}
                  onChange={(e) => setCreateForm({ ...createForm, paidAmount: e.target.value })}
                />
              </div>
            </div>

            {/* Calculated Outstanding Preview */}
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-900 dark:text-amber-200">Calculated Outstanding:</span>
              <span className="font-black text-rose-600 text-base">
                {formatCurrency(calculatedOutstanding)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Due Date (Default: 30 days)</label>
              <Input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Notes / Items Description</label>
              <Input
                placeholder="e.g. 2 Suits bought on credit..."
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold">
              {loading ? "Saving..." : "Save Udhaar Record"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Udhaar Entry Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-amber-600">
              <Edit className="h-5 w-5" />
              <span>Edit Udhaar Record</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateUdhaar} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Total Bill Amount (₹) <span className="text-red-500">*</span></label>
                <Input
                  type="number"
                  value={editForm.totalAmount}
                  onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Due Date <span className="text-red-500">*</span></label>
                <Input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Notes</label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold">
              {loading ? "Updating..." : "Update Udhaar Record"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receive Payment Modal */}
      <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-emerald-600">
              <CreditCard className="h-5 w-5" />
              <span>Receive Udhaar Payment</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            {selectedEntry && (
              <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200 text-xs">
                <div className="font-bold text-amber-900 dark:text-amber-300">
                  Customer: {selectedEntry.customer?.name} ({selectedEntry.customer?.mobile})
                </div>
                <div className="flex justify-between mt-1 text-amber-700 dark:text-amber-400">
                  <span>Total Bill: {formatCurrency(selectedEntry.totalAmount)}</span>
                  <span className="font-bold text-rose-600">Remaining: {formatCurrency(selectedEntry.remainingAmount)}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Collected Amount (₹) <span className="text-red-500">*</span></label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 1000"
                value={payForm.amount}
                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Payment Method</label>
              <Select
                value={payForm.paymentMethod}
                onValueChange={(val) => setPayForm({ ...payForm, paymentMethod: val || "CASH" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK">Bank Transfer</SelectItem>
                  <SelectItem value="CARD">Debit / Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Reference / Txn ID</label>
              <Input
                placeholder="e.g. UPI Txn ID"
                value={payForm.referenceNo}
                onChange={(e) => setPayForm({ ...payForm, referenceNo: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {loading ? "Processing..." : "Record Payment & Update Ledger"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-indigo-600">
              <History className="h-5 w-5" />
              <span>Udhaar Payment History</span>
            </DialogTitle>
          </DialogHeader>

          {historyEntry && (
            <div className="space-y-4 pt-2">
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border text-xs">
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  {historyEntry.customer?.name} ({historyEntry.customer?.mobile})
                </div>
                <div className="flex justify-between mt-1 text-gray-500">
                  <span>Bill Total: {formatCurrency(historyEntry.totalAmount)}</span>
                  <span>Paid: {formatCurrency(historyEntry.paidAmount)}</span>
                </div>
              </div>

              <div className="rounded-xl border overflow-hidden text-xs">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyEntry.payments?.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>{new Date(p.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-blue-600">{p.paymentMethod}</TableCell>
                        <TableCell className="text-right font-extrabold text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                      </TableRow>
                    ))}
                    {(!historyEntry.payments || historyEntry.payments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          No payment receipts logged yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
