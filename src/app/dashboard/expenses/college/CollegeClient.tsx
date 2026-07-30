"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle2 } from "lucide-react";
import { createCollegeFee } from "@/actions/expenses";
import { Badge } from "@/components/ui/badge";

export default function CollegeClient({ initialFees }: { initialFees: any[] }) {
  const [fees, setFees] = useState(initialFees);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    collegeName: "",
    course: "",
    semester: "",
    feeAmount: "",
    dueDate: new Date().toISOString().split('T')[0],
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createCollegeFee(formData);
    if (res.success) {
      setFees([...fees, res.fee].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      setOpen(false);
      setFormData({
        collegeName: "", course: "", semester: "", feeAmount: "", dueDate: new Date().toISOString().split('T')[0]
      });
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Fee Record</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add College Fee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">College Name</label>
                <Input value={formData.collegeName} onChange={(e) => setFormData({...formData, collegeName: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <Input value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <Input value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fee Amount</label>
                  <Input type="number" step="0.01" value={formData.feeAmount} onChange={(e) => setFormData({...formData, feeAmount: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Due Date</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Course/Sem</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell>{new Date(fee.dueDate).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{fee.collegeName}</TableCell>
                <TableCell>{fee.course} ({fee.semester})</TableCell>
                <TableCell className="font-bold">₹{fee.feeAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={fee.paymentStatus === 'PAID' ? 'default' : fee.paymentStatus === 'OVERDUE' ? 'destructive' : 'secondary'}>
                    {fee.paymentStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {fees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No college fees tracked.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
