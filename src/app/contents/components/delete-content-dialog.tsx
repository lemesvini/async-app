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
import { deleteContent } from "@/app/contents/api/get-contents";
import type { Content } from "@/app/contents/api/get-contents";

interface DeleteContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content | null;
  onSuccess: () => void;
}

export function DeleteContentDialog({
  open,
  onOpenChange,
  content,
  onSuccess,
}: DeleteContentDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!content) return;

    setIsLoading(true);
    try {
      await deleteContent(content.id);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting content:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Content</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{content?.title}"? This action
            cannot be undone.
            {content?.classLessons && content.classLessons.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                <strong>Warning:</strong> This content has{" "}
                {content.classLessons.length} related lesson(s). You may need to
                remove those lessons first.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
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
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
