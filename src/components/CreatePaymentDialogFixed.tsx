import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { DollarSign, User, Calendar } from "lucide-react";
import { toast } from "sonner";

interface CreatePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Student {
  id: string;
  fullName: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  isActive: boolean;
}

export function CreatePaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

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

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadStudents();
      loadClasses();
    }
  }, [open]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await apiClient.getUsers({
        role: "STUDENT",
        limit: "100",
      });
      setStudents(
        response.users.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        }))
      );
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await apiClient.getClasses();
      setClasses(response.classes.filter((cls) => cls.isActive));
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setLoadingClasses(false);
    }
  };

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
        classId: formData.classId || undefined,
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
    } catch (error: any) {
      console.error("Error creating payment:", error);

      // More specific error handling
      let errorMessage = "Failed to create payment";
      if (error?.message?.includes("Student or class not found")) {
        errorMessage = "Selected student or class not found. Please try again.";
      } else if (error?.message?.includes("Invalid request")) {
        errorMessage = "Invalid payment information. Please check your input.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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
  };

  const handleDialogClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Create New Payment
          </DialogTitle>
          <DialogDescription>
            Add a new payment for a student. Fill in all the required fields.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Student Selection */}
          <div className="grid gap-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Student Information
            </h4>

            <div className="grid gap-2">
              <Label htmlFor="student">Student *</Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, studentId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {loadingStudents ? (
                    <SelectItem value="loading" disabled>
                      Loading students...
                    </SelectItem>
                  ) : students.length === 0 ? (
                    <SelectItem value="no-students" disabled>
                      No students found
                    </SelectItem>
                  ) : (
                    students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {student.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {student.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="class">Class (Optional)</Label>
              <Select
                value={formData.classId}
                onValueChange={(value) =>
                  setFormData({ ...formData, classId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a class (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClasses ? (
                    <SelectItem value="loading" disabled>
                      Loading classes...
                    </SelectItem>
                  ) : classes.length === 0 ? (
                    <SelectItem value="no-classes" disabled>
                      No active classes found
                    </SelectItem>
                  ) : (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formData.classId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, classId: "" })}
                  className="mt-1"
                >
                  Clear selection
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div className="grid gap-4">
            <h4 className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Details
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
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

              <div className="grid gap-2">
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
            </div>

            <div className="grid gap-2">
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
          </div>

          <Separator />

          {/* Reference Period */}
          <div className="grid gap-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reference Period
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={formData.referenceMonth.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      referenceMonth: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="w-full">
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

              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2025"
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

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingStudents}>
              {loading ? "Creating..." : "Create Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
