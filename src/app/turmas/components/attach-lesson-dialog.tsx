import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { type Turma } from "../api/get-turmas";
import {
  getContentsByModule,
  type Content,
} from "@/app/contents/api/get-contents";
import { createLesson, type CreateLessonInput } from "../api/lessons-api";

interface AttachLessonDialogProps {
  turma: Turma | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AttachLessonDialog({
  turma,
  open,
  onOpenChange,
  onSuccess,
}: AttachLessonDialogProps) {
  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [lessonDate, setLessonDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [contents, setContents] = useState<Content[]>([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContentSelectorOpen, setIsContentSelectorOpen] = useState(false);

  const selectedContent = contents.find((c) => c.id === selectedContentId);

  // Load contents when dialog opens and we have a class level
  useEffect(() => {
    if (open && turma?.level) {
      loadContents();
    }
  }, [open, turma?.level]);

  const loadContents = async () => {
    if (!turma?.level) return;

    try {
      setLoadingContents(true);
      const moduleContents = await getContentsByModule(turma.level);
      setContents(moduleContents);
    } catch (error) {
      console.error("Failed to load contents:", error);
      toast.error("Failed to load available contents");
      setContents([]);
    } finally {
      setLoadingContents(false);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedContentId) {
      toast.error("Please select content for the lesson");
      return false;
    }
    if (!lessonDate) {
      toast.error("Please select a lesson date");
      return false;
    }

    // Validate date format
    const date = new Date(lessonDate);
    if (isNaN(date.getTime())) {
      toast.error("Invalid date format");
      return false;
    }

    // Check if date is in the past (optional validation)
    const now = new Date();
    if (date < now) {
      // Allow past dates but warn user
      console.warn("Selected date is in the past");
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!turma || !validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const lessonInput: CreateLessonInput = {
        classId: turma.id,
        contentId: selectedContentId,
        lessonDate: new Date(lessonDate).toISOString(),
        notes: notes.trim() || undefined,
      };

      await createLesson(lessonInput);

      // Reset form
      resetForm();

      // Close dialog
      onOpenChange(false);

      // Notify parent of success
      onSuccess?.();

      // Show success toast
      toast.success(
        `Lesson "${selectedContent?.title}" attached successfully!`
      );
    } catch (error) {
      console.error("Failed to attach lesson:", error);

      let errorMessage = "Failed to attach lesson. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Class or content not found.";
        } else if (error.message.includes("409")) {
          errorMessage =
            "A lesson with the same content and date already exists.";
        } else if (error.message.includes("401")) {
          errorMessage = "You don't have permission to create lessons.";
        } else if (error.message.includes("already exists")) {
          errorMessage =
            "A lesson with this content and date already exists for this class.";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedContentId("");
    setLessonDate("");
    setNotes("");
    setIsContentSelectorOpen(false);
  };

  const handleDialogClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Format datetime for input field (expects YYYY-MM-DDTHH:MM format)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Set default date to next class time if available
  useEffect(() => {
    if (open && turma && !lessonDate) {
      const now = new Date();
      const defaultDate = new Date(turma.startTime);

      // Set date to today but with class time
      defaultDate.setFullYear(now.getFullYear());
      defaultDate.setMonth(now.getMonth());
      defaultDate.setDate(now.getDate());

      setLessonDate(formatDateForInput(defaultDate));
    }
  }, [open, turma, lessonDate]);

  if (!turma) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Attach Lesson
          </DialogTitle>
          <DialogDescription>
            Attach a lesson to "{turma.name}" class
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Content Selection */}
          <div className="grid gap-2">
            <Label htmlFor="content">Content *</Label>
            <Popover
              open={isContentSelectorOpen}
              onOpenChange={setIsContentSelectorOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isContentSelectorOpen}
                  className={cn(
                    "w-full justify-between",
                    !selectedContentId && "text-muted-foreground"
                  )}
                >
                  {selectedContentId
                    ? `${selectedContent?.title} (${selectedContent?.module} - ${selectedContent?.order})`
                    : "Choose content..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <div className="flex flex-col h-[200px]">
                  <div className="p-2 border-b">
                    <h4 className="font-medium text-sm">
                      {turma.level} Level Contents
                    </h4>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {loadingContents ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading contents...
                      </div>
                    ) : contents.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No contents available for {turma.level} level
                      </div>
                    ) : (
                      <div className="p-1">
                        {contents.map((content) => (
                          <div
                            key={content.id}
                            className={cn(
                              "px-3 py-2 text-sm hover:bg-muted cursor-pointer rounded-md",
                              selectedContentId === content.id && "bg-muted"
                            )}
                            onClick={() => {
                              setSelectedContentId(content.id);
                              setIsContentSelectorOpen(false);
                            }}
                          >
                            <div className="font-medium">{content.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {content.module} - Lesson {content.order}
                              {content.description &&
                                ` • ${content.description}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Lesson Date */}
          <div className="grid gap-2">
            <Label htmlFor="lessonDate">Lesson Date & Time *</Label>
            <Input
              id="lessonDate"
              type="datetime-local"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this lesson..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!selectedContentId || !lessonDate || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Attaching..." : "Attach Lesson"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
