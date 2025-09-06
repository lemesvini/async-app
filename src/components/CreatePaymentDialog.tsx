import { useState } from "react";
import { apiClient, type CreatePaymentInput } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatePaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    amount: "",
    description: "",
    dueDate: "",
    referenceMonth: new Date().getMonth() + 1,
    referenceYear: new Date().getFullYear(),
    notes: "",
  });

  // Mock data - in a real app, you'd fetch this from the API
  const students = [
    { id: "1", fullName: "John Doe" },
    { id: "2", fullName: "Jane Smith" },
    { id: "3", fullName: "Bob Johnson" },
  ];

  const classes = [
    { id: "1", name: "English A1" },
    { id: "2", name: "English B1" },
    { id: "3", name: "Conversation A2" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.studentId ||
      !formData.amount ||
      !formData.description ||
      !formData.dueDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const input: CreatePaymentInput = {
        studentId: formData.studentId,
        classId:
          formData.classId && formData.classId !== "none"
            ? formData.classId
            : undefined,
        amount: parseFloat(formData.amount),
        description: formData.description,
        dueDate: new Date(formData.dueDate).toISOString(),
        referenceMonth: formData.referenceMonth,
        referenceYear: formData.referenceYear,
        notes: formData.notes || undefined,
      };

      await apiClient.createPayment(input);
      toast.success("Payment created successfully");

      // Reset form
      setFormData({
        studentId: "",
        classId: "",
        amount: "",
        description: "",
        dueDate: "",
        referenceMonth: new Date().getMonth() + 1,
        referenceYear: new Date().getFullYear(),
        notes: "",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Payment</DialogTitle>
          <DialogDescription>
            Add a new payment for a student. Fill in all the required fields.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <Select
              value={formData.studentId}
              onValueChange={(value) =>
                setFormData({ ...formData, studentId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class (Optional)</Label>
            <Select
              value={formData.classId}
              onValueChange={(value) =>
                setFormData({ ...formData, classId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific class</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Payment description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={formData.referenceMonth.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, referenceMonth: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(2000, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="2024"
                value={formData.referenceYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    referenceYear:
                      parseInt(e.target.value) || new Date().getFullYear(),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
