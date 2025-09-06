import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";
import type { Student } from "@/app/students/api/get-students";
import { deleteStudent } from "@/app/students/api/delete-student";

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess: () => void;
}

export function DeleteStudentDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: DeleteStudentDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!student) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteStudent(student.id);
      onSuccess();
      onOpenChange(false);
      toast.success(`Student "${student.fullName}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting student:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete student"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setError(null);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <IconAlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this student? This action cannot
                be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3">
          <div className="text-sm">
            <p className="font-medium">Student Details:</p>
            <p className="text-muted-foreground">Name: {student.fullName}</p>
            <p className="text-muted-foreground">Email: {student.email}</p>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
