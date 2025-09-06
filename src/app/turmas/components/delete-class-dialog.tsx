import * as React from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteTurma, type Turma } from "../api/get-turmas";

interface DeleteClassDialogProps {
  turma: Turma | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteClassDialog({
  turma,
  open,
  onOpenChange,
  onSuccess,
}: DeleteClassDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!turma) return;

    setIsLoading(true);
    setError(null);
    try {
      await deleteTurma(turma.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error deleting class:", error);
      setError(error.message || "Failed to delete class");
    } finally {
      setIsLoading(false);
    }
  };

  if (!turma) return null;

  // Check if class has active enrollments
  const hasActiveEnrollments =
    turma.enrollments?.some((e) => e.isActive) || false;
  const activeEnrollmentsCount =
    turma.enrollments?.filter((e) => e.isActive).length || 0;

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
              <DialogTitle>Delete Class</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this class? This action cannot
                be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border p-4 space-y-2">
          <div className="font-medium">{turma.name}</div>
          <div className="text-sm text-muted-foreground">
            {turma.description}
          </div>
          <div className="text-sm text-muted-foreground">
            Level: {turma.level} • Type: {turma.type}
          </div>
          {hasActiveEnrollments && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-sm font-medium text-amber-800">
                ⚠️ Warning: Active Enrollments
              </div>
              <div className="text-xs text-amber-700 mt-1">
                This class has {activeEnrollmentsCount} active student
                {activeEnrollmentsCount !== 1 ? "s" : ""} enrolled. Deleting
                this class will remove all enrollments.
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm font-medium text-red-800">Error</div>
            <div className="text-xs text-red-700 mt-1">{error}</div>
          </div>
        )}

        <DialogFooter className="gap-2">
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
            {isLoading ? "Deleting..." : "Delete Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
