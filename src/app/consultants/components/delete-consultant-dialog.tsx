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
import type { Consultant } from "@/app/consultants/api/get-consultants";
import { deleteConsultant } from "@/app/consultants/api/delete-consultant";

interface DeleteConsultantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultant: Consultant | null;
  onSuccess: () => void;
}

export function DeleteConsultantDialog({
  open,
  onOpenChange,
  consultant,
  onSuccess,
}: DeleteConsultantDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!consultant) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteConsultant(consultant.id);
      onSuccess();
      onOpenChange(false);
      toast.success(
        `Consultant "${consultant.fullName}" deleted successfully!`
      );
    } catch (error) {
      console.error("Error deleting consultant:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete consultant"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!consultant) return null;

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
              <DialogTitle>Delete Consultant</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this consultant? This action
                cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3">
          <div className="text-sm">
            <p className="font-medium">Consultant Details:</p>
            <p className="text-muted-foreground">Name: {consultant.fullName}</p>
            <p className="text-muted-foreground">Email: {consultant.email}</p>
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
            {isLoading ? "Deleting..." : "Delete Consultant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
