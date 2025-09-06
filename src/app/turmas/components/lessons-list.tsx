import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconCalendar,
  IconBook,
  IconCheck,
  IconClock,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { type Turma } from "../api/get-turmas";
import {
  getClassLessons,
  deleteLesson,
  updateLesson,
  type LessonResponse,
} from "../api/lessons-api";

interface LessonsListProps {
  turma: Turma | null;
  onLessonChange?: () => void;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function LessonsList({ turma, onLessonChange }: LessonsListProps) {
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingLesson, setUpdatingLesson] = useState<string | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<LessonResponse | null>(
    null
  );

  // Load lessons when turma changes
  useEffect(() => {
    if (turma) {
      loadLessons();
    }
  }, [turma]);

  const loadLessons = async () => {
    if (!turma) return;

    try {
      setLoading(true);
      const classLessons = await getClassLessons(turma.id);
      setLessons(classLessons);
    } catch (error) {
      console.error("Failed to load lessons:", error);
      toast.error("Failed to load lessons");
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async (lesson: LessonResponse) => {
    try {
      setUpdatingLesson(lesson.id);

      await updateLesson(lesson.id, {
        wasCompleted: !lesson.wasCompleted,
      });

      // Refresh lessons
      await loadLessons();

      // Notify parent
      onLessonChange?.();

      toast.success(
        lesson.wasCompleted
          ? "Lesson marked as incomplete"
          : "Lesson marked as completed"
      );
    } catch (error) {
      console.error("Failed to update lesson:", error);
      toast.error("Failed to update lesson completion status");
    } finally {
      setUpdatingLesson(null);
    }
  };

  const handleDeleteClick = (lesson: LessonResponse) => {
    setLessonToDelete(lesson);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!lessonToDelete) return;

    try {
      setDeletingLesson(lessonToDelete.id);

      await deleteLesson(lessonToDelete.id);

      // Refresh lessons
      await loadLessons();

      // Notify parent
      onLessonChange?.();

      toast.success(
        `Lesson "${
          lessonToDelete.content?.title || "Unknown"
        }" deleted successfully`
      );

      // Reset state
      setShowDeleteConfirm(false);
      setLessonToDelete(null);
    } catch (error) {
      console.error("Failed to delete lesson:", error);

      let errorMessage = "Failed to delete lesson";
      if (error instanceof Error) {
        if (error.message.includes("attendance records")) {
          errorMessage =
            "Cannot delete lesson with existing attendance records";
        } else if (error.message.includes("404")) {
          errorMessage = "Lesson not found";
        } else if (error.message.includes("401")) {
          errorMessage = "You don't have permission to delete lessons";
        } else if (error.message.includes("403")) {
          errorMessage = "Access denied";
        } else {
          // Use the actual error message from the API if available
          errorMessage = error.message || "Failed to delete lesson";
        }
      }

      toast.error(errorMessage);
    } finally {
      setDeletingLesson(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setLessonToDelete(null);
  };

  if (!turma) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading lessons...</div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center p-8">
        <IconBook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No Lessons Yet</h3>
        <p className="text-muted-foreground mb-4">
          This class doesn't have any lessons attached yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <IconBook className="h-4 w-4" />
            Lessons ({lessons.length})
          </h4>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Content Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium truncate">
                        {lesson.content?.title || "Unknown Content"}
                      </h5>
                      <Badge
                        variant={lesson.wasCompleted ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {lesson.wasCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </div>

                    {/* Content Details */}
                    {lesson.content && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {lesson.content.module} - Lesson {lesson.content.order}
                        {lesson.content.description && (
                          <span> • {lesson.content.description}</span>
                        )}
                      </div>
                    )}

                    {/* Date & Time */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <IconCalendar className="h-3 w-3" />
                        {formatDate(lesson.lessonDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {formatTime(lesson.lessonDate)}
                      </div>
                    </div>

                    {/* Notes */}
                    {lesson.notes && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <strong>Notes:</strong> {lesson.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCompletion(lesson)}
                      disabled={updatingLesson === lesson.id}
                      className={lesson.wasCompleted ? "text-green-600" : ""}
                    >
                      <IconCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(lesson)}
                      disabled={deletingLesson === lesson.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Attendance Info */}
                {lesson.attendance && lesson.attendance.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="text-sm">
                      <div className="font-medium mb-1">
                        Attendance ({lesson.attendance.length} records)
                      </div>
                      <div className="flex gap-4 text-muted-foreground">
                        <span>
                          Present:{" "}
                          {
                            lesson.attendance.filter(
                              (a) => a.status === "PRESENT"
                            ).length
                          }
                        </span>
                        <span>
                          Absent:{" "}
                          {
                            lesson.attendance.filter(
                              (a) => a.status === "ABSENT"
                            ).length
                          }
                        </span>
                        <span>
                          Late:{" "}
                          {
                            lesson.attendance.filter((a) => a.status === "LATE")
                              .length
                          }
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Lesson Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the lesson{" "}
              <span className="font-medium">
                "{lessonToDelete?.content?.title || "Unknown"}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={!!deletingLesson}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!!deletingLesson}
            >
              {deletingLesson ? "Deleting..." : "Delete Lesson"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
