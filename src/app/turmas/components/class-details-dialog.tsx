import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  IconClock,
  IconUsers,
  IconMail,
  IconCalendar,
  IconUser,
  IconUserPlus,
  IconSearch,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { type Turma } from "../api/get-turmas";
import { getStudents, type Student } from "@/app/students/api/get-students";
import {
  enrollStudentInTurma,
  unenrollStudentFromTurma,
} from "../api/get-turmas";
import useDebounce from "@/hooks/use-debounce";

interface ClassDetailsDialogProps {
  turma: Turma | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrollmentSuccess?: () => void;
}

// Helper function to get day name
const getDayName = (dayOfWeek: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayOfWeek] || "Unknown";
};

// Helper function to format time
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export function ClassDetailsDialog({
  turma,
  open,
  onOpenChange,
  onEnrollmentSuccess,
}: ClassDetailsDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [isStudentSelectorOpen, setIsStudentSelectorOpen] = useState(false);
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
  const [studentToUnenroll, setStudentToUnenroll] = useState<{
    id: string;
    name: string;
    enrollmentId: string;
  } | null>(null);
  const [isUnenrolling, setIsUnenrolling] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Get enrolled student IDs for filtering
  const enrolledStudentIds =
    turma?.enrollments?.filter((e) => e.isActive).map((e) => e.studentId) || [];

  // Load students when dialog opens or search changes
  useEffect(() => {
    if (open && showEnrollForm) {
      loadStudents();
    }
  }, [open, showEnrollForm]);

  // Filter available students
  const availableStudents = students.filter(
    (student) =>
      !enrolledStudentIds.includes(student.id) &&
      (debouncedSearch === "" ||
        student.fullName
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await getStudents(1, 100);
      setStudents(response.users || []);
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudentId || !turma) {
      return;
    }

    const selectedStudent = students.find((s) => s.id === selectedStudentId);

    try {
      setIsEnrolling(true);

      await enrollStudentInTurma(turma.id, { studentId: selectedStudentId });

      // Reset form
      setSelectedStudentId("");
      setSearchTerm("");
      setShowEnrollForm(false);
      setIsStudentSelectorOpen(false);

      // Notify parent of successful enrollment
      onEnrollmentSuccess?.();

      // Show success toast
      toast.success(
        `${selectedStudent?.fullName || "Student"} enrolled successfully!`
      );
    } catch (error) {
      console.error("Failed to enroll student:", error);

      // Handle different error types
      let errorMessage = "Failed to enroll student. Please try again.";

      if (error instanceof Error) {
        if (
          error.message.includes("409") ||
          error.message.includes("already enrolled")
        ) {
          errorMessage = "This student is already enrolled in this class.";
        } else if (
          error.message.includes("401") ||
          error.message.includes("unauthorized")
        ) {
          errorMessage = "You don't have permission to enroll students.";
        } else if (error.message.includes("404")) {
          errorMessage = "Class or student not found.";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDialogClose = () => {
    setShowEnrollForm(false);
    setSelectedStudentId("");
    setSearchTerm("");
    setIsStudentSelectorOpen(false);
    onOpenChange(false);
  };

  const handleCancelEnrollment = () => {
    setShowEnrollForm(false);
    setSelectedStudentId("");
    setSearchTerm("");
    setIsStudentSelectorOpen(false);
  };

  const handleUnenrollClick = (enrollment: any) => {
    setStudentToUnenroll({
      id: enrollment.student.id,
      name: enrollment.student.fullName,
      enrollmentId: enrollment.id,
    });
    setShowUnenrollConfirm(true);
  };

  const handleConfirmUnenroll = async () => {
    if (!studentToUnenroll || !turma) {
      return;
    }

    try {
      setIsUnenrolling(true);

      await unenrollStudentFromTurma(turma.id, studentToUnenroll.id);

      // Reset state
      setShowUnenrollConfirm(false);
      setStudentToUnenroll(null);

      // Notify parent of successful unenrollment
      onEnrollmentSuccess?.();

      // Show success toast
      toast.success(`${studentToUnenroll.name} unenrolled successfully!`);
    } catch (error) {
      console.error("Failed to unenroll student:", error);

      // Handle different error types
      let errorMessage = "Failed to unenroll student. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("404")) {
          errorMessage = "Enrollment not found.";
        } else if (
          error.message.includes("401") ||
          error.message.includes("unauthorized")
        ) {
          errorMessage = "You don't have permission to unenroll students.";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsUnenrolling(false);
    }
  };

  const handleCancelUnenroll = () => {
    setShowUnenrollConfirm(false);
    setStudentToUnenroll(null);
  };

  if (!turma) return null;

  const activeEnrollments = turma.enrollments?.filter((e) => e.isActive) || [];

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              {turma.name}
            </DialogTitle>
            <DialogDescription>
              View class details and manage student enrollments
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            {/* Class Basic Information */}
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{turma.level}</Badge>
                <Badge
                  variant={turma.type === "CORPORATE" ? "default" : "outline"}
                >
                  {turma.type}
                </Badge>
                <Badge variant={turma.isActive ? "default" : "secondary"}>
                  {turma.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {turma.description && (
                <p className="text-sm text-muted-foreground">
                  {turma.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Schedule Information */}
            <div className="grid gap-3">
              <h4 className="font-medium flex items-center gap-2">
                <IconClock className="h-4 w-4" />
                Schedule
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Day</Label>
                  <p className="font-medium">{getDayName(turma.dayOfWeek)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p className="font-medium">
                    {formatTime(turma.startTime)} - {formatTime(turma.endTime)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Consultant Information */}
            <div className="grid gap-3">
              <h4 className="font-medium flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                Consultant
              </h4>
              {turma.consultant ? (
                <div className="grid gap-2 text-sm">
                  <p className="font-medium">{turma.consultant.fullName}</p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <IconMail className="h-3 w-3" />
                    {turma.consultant.email}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No consultant assigned
                </p>
              )}
            </div>

            <Separator />

            {/* Enrollment Information */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <IconUsers className="h-4 w-4" />
                  Students ({activeEnrollments.length}/{turma.maxStudents})
                </h4>
                {!showEnrollForm &&
                  activeEnrollments.length < turma.maxStudents && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEnrollForm(true)}
                      className="gap-1"
                    >
                      <IconUserPlus className="h-3 w-3" />
                      Enroll Student
                    </Button>
                  )}
              </div>

              {/* Enrollment Form */}
              {showEnrollForm && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h5 className="font-medium mb-3">Enroll New Student</h5>
                  <div className="grid gap-3">
                    <div>
                      <Label>Select Student</Label>
                      <Popover
                        open={isStudentSelectorOpen}
                        onOpenChange={setIsStudentSelectorOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isStudentSelectorOpen}
                            className={cn(
                              "w-full justify-between",
                              !selectedStudentId && "text-muted-foreground"
                            )}
                          >
                            {selectedStudentId
                              ? selectedStudent?.fullName || "Student not found"
                              : "Choose a student..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <div className="flex flex-col h-[300px]">
                            <div className="p-2 border-b">
                              <div className="flex items-center gap-2">
                                <IconSearch className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search students..."
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                  className="border-0 focus-visible:ring-0 p-0"
                                />
                                {searchTerm && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchTerm("")}
                                    className="p-1 h-auto"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                              {loadingStudents ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  Loading students...
                                </div>
                              ) : availableStudents.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  {searchTerm
                                    ? "No students found"
                                    : "No available students"}
                                </div>
                              ) : (
                                <div className="p-1">
                                  {availableStudents.map((student) => (
                                    <div
                                      key={student.id}
                                      className={cn(
                                        "px-3 py-2 text-sm hover:bg-muted cursor-pointer rounded-md",
                                        selectedStudentId === student.id &&
                                          "bg-muted"
                                      )}
                                      onClick={() => {
                                        setSelectedStudentId(student.id);
                                        setIsStudentSelectorOpen(false);
                                      }}
                                    >
                                      <div className="font-medium">
                                        {student.fullName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {student.email}
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

                    <div className="flex gap-2">
                      <Button
                        onClick={handleEnrollStudent}
                        disabled={!selectedStudentId || isEnrolling}
                        size="sm"
                      >
                        {isEnrolling ? "Enrolling..." : "Enroll Student"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEnrollment}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Enrollments */}
              {activeEnrollments.length > 0 ? (
                <div className="grid gap-2">
                  {activeEnrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {enrollment.student.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {enrollment.student.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Enrolled: {formatDate(enrollment.enrolledAt)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnenrollClick(enrollment)}
                          className=" hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No students enrolled yet
                </p>
              )}
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">{formatDate(turma.createdAt)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="font-medium">{formatDate(turma.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
        </DialogFooter> */}
        </DialogContent>
      </Dialog>

      {/* Unenroll Confirmation Dialog */}
      <Dialog open={showUnenrollConfirm} onOpenChange={setShowUnenrollConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Unenrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to unenroll{" "}
              <span className="font-medium">{studentToUnenroll?.name}</span>{" "}
              from this class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCancelUnenroll}
              disabled={isUnenrolling}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmUnenroll}
              disabled={isUnenrolling}
            >
              {isUnenrolling ? "Removing..." : "Remove Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
