"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  UserCheck,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  FileText,
  Clock,
  Eye,
  Award,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { createCustomer, updateCustomer, deleteCustomer, getCustomerDetails } from "@/actions/customers";

export default function CustomerCrmClient({
  customers,
  analytics,
}: {
  customers: any[];
  analytics: {
    totalCustomers: number;
    totalPurchasesCount: number;
    totalAmountSpent: number;
    avgBillValue: number;
    totalOutstandingUdhaar: number;
    monthlyVisitCount: number;
    yearlyVisitCount: number;
    monthlyRepeatCount: number;
    yearlyRepeatCount: number;
    repeatVisitRate: number;
    monthlyVisitsTrend: Array<{ month: string; visits: number; newCustomers: number; returningCustomers: number }>;
  };
}) {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [detailedCustomer, setDetailedCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    gst: "",
    address: "",
    notes: "",
  });

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) return;
    setLoading(true);
    const res = await createCustomer(form);
    if (res.success) {
      setShowAddModal(false);
      setForm({ name: "", mobile: "", email: "", gst: "", address: "", notes: "" });
      alert("Customer created successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to create customer");
    }
    setLoading(false);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c);
    setForm({
      name: c.name || "",
      mobile: c.mobile || "",
      email: c.email || "",
      gst: c.gst || "",
      address: c.address || "",
      notes: c.notes || "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !form.name.trim() || !form.mobile.trim()) return;
    setLoading(true);
    const res = await updateCustomer(editingCustomer.id, form);
    if (res.success) {
      setShowEditModal(false);
      setEditingCustomer(null);
      alert("Customer details updated successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to update customer");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    const res = await deleteCustomer(id);
    if (res.success) {
      alert("Customer deleted successfully!");
      window.location.reload();
    } else {
      alert(res.error || "Failed to delete customer");
    }
  };

  const handleViewDetail = async (id: string) => {
    setLoading(true);
    const res = await getCustomerDetails(id);
    if (res.success) {
      setDetailedCustomer(res.data);
      setShowDetailModal(true);
    }
    setLoading(false);
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.mobile.includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.gst?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-400/30 mb-2">
            <Users className="h-3.5 w-3.5" />
            <span>Retail Customer CRM & Repeat Visit Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold">Customer Management</h2>
          <p className="text-xs text-slate-300">
            Track customer visits, repeat visit rates, purchase history, and Udhaar credit limits
          </p>
        </div>

        <Button
          onClick={() => {
            setForm({ name: "", mobile: "", email: "", gst: "", address: "", notes: "" });
            setShowAddModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add New Customer
        </Button>
      </div>

      {/* Customer Analytics KPI Cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-gray-500">Total Customers</div>
          <div className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">
            {analytics.totalCustomers}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-indigo-600">Total Spent</div>
          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(analytics.totalAmountSpent)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-teal-600">Avg Bill Value</div>
          <div className="text-lg font-black text-teal-600 dark:text-teal-400 mt-1">
            {formatCurrency(analytics.avgBillValue)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-rose-600">Udhaar Outstanding</div>
          <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(analytics.totalOutstandingUdhaar)}
          </div>
        </div>
      </div>

      {/* Customer Directory Controls */}
      <div className="bg-white dark:bg-gray-950 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer name, mobile, email, GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-gray-900 text-xs"
          />
        </div>

        <div className="text-xs text-muted-foreground font-semibold">
          Showing {filteredCustomers.length} customers
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead className="font-bold">Customer Name</TableHead>
              <TableHead className="font-bold">Mobile</TableHead>
              <TableHead className="font-bold">Total Visits</TableHead>
              <TableHead className="font-bold">Customer Since</TableHead>
              <TableHead className="font-bold text-right">Udhaar Balance</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((c) => (
              <TableRow key={c.id} className="hover:bg-gray-50/50">
                <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                  <button
                    onClick={() => handleViewDetail(c.id)}
                    className="hover:text-indigo-600 text-left flex items-center space-x-1.5"
                  >
                    <span>{c.name}</span>
                    {c.visitCount > 1 && (
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        REPEAT ({c.visitCount}x)
                      </span>
                    )}
                  </button>
                </TableCell>
                <TableCell className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {c.mobile}
                </TableCell>
                <TableCell className="text-xs font-bold text-purple-600">
                  {c.visitCount || c._count?.customerVisits || 0} visits
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right font-extrabold text-rose-600 text-sm">
                  {formatCurrency(c.outstanding || 0)}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(c.id)}
                    className="h-8 text-xs text-indigo-600 border-indigo-200"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(c)}
                    className="h-8 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c.id, c.name)}
                    className="h-8 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  No customers found. Click "Add New Customer" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-indigo-600">
              <Users className="h-5 w-5" />
              <span>Add New Customer</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Customer Full Name <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Mobile Number <span className="text-red-500">*</span></label>
                <Input
                  placeholder="e.g. 9876543210"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Email Address</label>
                <Input
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">GST Number (Optional)</label>
              <Input
                placeholder="27AAAAA0000A1Z5"
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Residential / Office Address</label>
              <Textarea
                placeholder="Customer address..."
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {loading ? "Saving..." : "Save Customer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-indigo-600">
              <Edit className="h-5 w-5" />
              <span>Edit Customer Profile</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Customer Full Name <span className="text-red-500">*</span></label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Mobile Number <span className="text-red-500">*</span></label>
                <Input
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  required
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">GST Number</label>
              <Input
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Address</label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {loading ? "Updating..." : "Update Customer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Profile & Purchase History Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-indigo-600">
              <UserCheck className="h-5 w-5" />
              <span>Customer Relationship Profile</span>
            </DialogTitle>
          </DialogHeader>

          {detailedCustomer && (
            <div className="space-y-6 pt-2">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-indigo-950 dark:text-indigo-200">
                    {detailedCustomer.customer.name}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-indigo-700 dark:text-indigo-400 mt-1 font-medium">
                    <span>📱 {detailedCustomer.customer.mobile}</span>
                    <span>📍 {detailedCustomer.customer.address || "No address"}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Outstanding Udhaar</div>
                  <div className="text-xl font-black text-rose-600">
                    {formatCurrency(detailedCustomer.customer.outstanding)}
                  </div>
                </div>
              </div>

              {/* 4 Quick Metrics */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                  <div className="text-[10px] font-bold text-gray-500">TOTAL SPENT</div>
                  <div className="text-sm font-black text-indigo-600 mt-0.5">
                    {formatCurrency(detailedCustomer.totalSpent)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                  <div className="text-[10px] font-bold text-gray-500">TOTAL BILLS</div>
                  <div className="text-sm font-black text-blue-600 mt-0.5">
                    {detailedCustomer.totalBills}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                  <div className="text-[10px] font-bold text-gray-500">AVG BILL VALUE</div>
                  <div className="text-sm font-black text-teal-600 mt-0.5">
                    {formatCurrency(detailedCustomer.avgBillValue)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                  <div className="text-[10px] font-bold text-gray-500">TOTAL VISITS</div>
                  <div className="text-sm font-black text-purple-600 mt-0.5">
                    {detailedCustomer.customer.visitCount || detailedCustomer.customer.customerVisits.length}
                  </div>
                </div>
              </div>

              {/* Sales Orders Log */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  POS Purchase History ({detailedCustomer.customer.saleOrders.length})
                </h4>
                <div className="rounded-xl border overflow-hidden text-xs">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedCustomer.customer.saleOrders.map((o: any) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-bold">{o.invoiceNumber}</TableCell>
                          <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold text-indigo-600">{o.paymentStatus}</TableCell>
                          <TableCell className="text-right font-extrabold">{formatCurrency(o.grandTotal)}</TableCell>
                        </TableRow>
                      ))}
                      {detailedCustomer.customer.saleOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No POS purchases recorded yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
