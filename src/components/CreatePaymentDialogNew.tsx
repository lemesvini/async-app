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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import QueryInput from "@/components/query-input";
import { useForm } from "react-hook-form";

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

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      studentId: "",
      classId: "",
      amount: "",
      description: "",
      dueDate: "",
      referenceMonth: new Date().getMonth() + 1,
      referenceYear: new Date().getFullYear(),
      notes: "",
    },
  });

  const watchedValues = watch();

  // Query function for fetching students
  const fetchStudents = async (search?: string) => {
    try {
      const response = await apiClient.getUsers({
        role: "STUDENT",
        limit: "50",
      });

      let students = response.users;

      // Filter on frontend since backend might not support search yet
      if (search) {
        const searchLower = search.toLowerCase();
        students = students.filter(
          (user) =>
            user.fullName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
      }

      return students.map((user) => ({
        value: user.id,
        label: `${user.fullName} (${user.email})`,
      }));
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  };

  // Query function for fetching classes
  const fetchClasses = async (search?: string) => {
    try {
      const response = await apiClient.getClasses();
      let classes = response.classes.filter((cls) => cls.isActive);

      if (search) {
        classes = classes.filter((cls) =>
          cls.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      return classes.map((cls) => ({
        value: cls.id,
        label: cls.name,
      }));
    } catch (error) {
      console.error("Error fetching classes:", error);
      return [];
    }
  };

  const onSubmit = async (data: any) => {
    if (!data.studentId || !data.amount || !data.description || !data.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const input: CreatePaymentInput = {
        studentId: data.studentId,
        classId: data.classId || undefined,
        amount: parseFloat(data.amount),
        description: data.description,
        dueDate: new Date(data.dueDate).toISOString(),
        referenceMonth: Number(data.referenceMonth),
        referenceYear: Number(data.referenceYear),
        notes: data.notes || undefined,
      };

      await apiClient.createPayment(input);
      toast.success("Payment created successfully");

      reset();
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <QueryInput
              queryKey={["students"]}
              queryFn={fetchStudents}
              placeholder="Select a student"
              searchPlaceholder="Search students..."
              register={register("studentId")}
              onSelect={(value) => setValue("studentId", value)}
              selectedValue={watchedValues.studentId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class (Optional)</Label>
            <QueryInput
              queryKey={["classes"]}
              queryFn={fetchClasses}
              placeholder="Select a class"
              searchPlaceholder="Search classes..."
              register={register("classId")}
              onSelect={(value) => setValue("classId", value)}
              selectedValue={watchedValues.classId}
              allowUnselect={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Payment description"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                placeholder="1-12"
                {...register("referenceMonth", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2050"
                placeholder="2024"
                {...register("referenceYear", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              {...register("notes")}
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
