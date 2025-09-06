import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconCalendar,
  IconUser,
  IconUsers,
  IconUserPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  createTurma,
  enrollStudentInTurma,
  type CreateTurmaInput,
} from "../api/get-turmas";
import { getStudents, type Student } from "@/app/students/api/get-students";
import {
  getConsultants,
  type Consultant,
} from "@/app/consultants/api/get-consultants";
import useDebounce from "@/hooks/use-debounce";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Available CEFR levels
const CEFR_LEVELS = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "CONVERSATION_A1",
  "CONVERSATION_A2",
  "CONVERSATION_B1",
  "CONVERSATION_B2",
  "CONVERSATION_C1",
  "CONVERSATION_C2",
] as const;

// Days of the week
const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function CreateClassDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateClassDialogProps) {
  // Form state
  const [formData, setFormData] = useState<CreateTurmaInput>({
    name: "",
    description: "",
    type: "PRIVATE",
    level: "A1",
    maxStudents: 10,
    isActive: true,
    startTime: "",
    endTime: "",
    dayOfWeek: 1, // Monday
    consultantId: undefined,
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showStudentSelection, setShowStudentSelection] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load consultants when dialog opens
  useEffect(() => {
    if (open) {
      loadConsultants();
    }
  }, [open]);

  // Load students when student selection is shown
  useEffect(() => {
    if (showStudentSelection && students.length === 0) {
      loadStudents();
    }
  }, [showStudentSelection, students.length]);

  const loadConsultants = async () => {
    try {
      setLoadingConsultants(true);
      const response = await getConsultants(1, 100);
      setConsultants(response.users || []);
    } catch (error) {
      console.error("Failed to load consultants:", error);
      toast.error("Failed to load consultants");
    } finally {
      setLoadingConsultants(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await getStudents(1, 100);
      setStudents(response.users || []);
    } catch (error) {
      console.error("Failed to load students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filter available students based on search
  const availableStudents = students.filter(
    (student) =>
      debouncedSearch === "" ||
      student.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleInputChange = (field: keyof CreateTurmaInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const removeSelectedStudent = (studentId: string) => {
    setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Class name is required");
      return false;
    }
    if (!formData.startTime) {
      toast.error("Start time is required");
      return false;
    }
    if (!formData.endTime) {
      toast.error("End time is required");
      return false;
    }

    // Validate datetime format and order
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (isNaN(startDate.getTime())) {
      toast.error("Invalid start time format");
      return false;
    }

    if (isNaN(endDate.getTime())) {
      toast.error("Invalid end time format");
      return false;
    }

    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return false;
    }

    if (selectedStudents.length > (formData.maxStudents || 10)) {
      toast.error(
        `Cannot select more than ${formData.maxStudents || 10} students`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Format datetime values to ISO string with timezone
      const formatToISODateTime = (datetimeLocal: string): string => {
        // datetime-local format: YYYY-MM-DDTHH:MM
        // ISO format needed: YYYY-MM-DDTHH:MM:SS.sssZ
        const date = new Date(datetimeLocal);
        return date.toISOString();
      };

      const formattedData = {
        ...formData,
        startTime: formatToISODateTime(formData.startTime),
        endTime: formatToISODateTime(formData.endTime),
      };

      // Create the class
      const newClass = await createTurma(formattedData);

      // Enroll selected students
      if (selectedStudents.length > 0) {
        const enrollmentPromises = selectedStudents.map((studentId) =>
          enrollStudentInTurma(newClass.id, { studentId })
        );

        await Promise.all(enrollmentPromises);
      }

      // Reset form
      resetForm();

      // Close dialog
      onOpenChange(false);

      // Notify parent of success
      onSuccess?.();

      // Show success toast
      toast.success(
        `Class "${newClass.name}" created successfully${
          selectedStudents.length > 0
            ? ` with ${selectedStudents.length} student(s) enrolled`
            : ""
        }!`
      );
    } catch (error) {
      console.error("Failed to create class:", error);

      let errorMessage = "Failed to create class. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "You don't have permission to create classes.";
        } else if (error.message.includes("404")) {
          errorMessage = "Consultant not found.";
        } else if (error.message.includes("403")) {
          errorMessage = "Selected user is not authorized to teach classes.";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "PRIVATE",
      level: "A1",
      maxStudents: 10,
      isActive: true,
      startTime: "",
      endTime: "",
      dayOfWeek: 1,
      consultantId: undefined,
    });
    setSelectedStudents([]);
    setSearchTerm("");
    setShowStudentSelection(false);
  };

  const handleDialogClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5" />
            Create New Class
          </DialogTitle>
          <DialogDescription>
            Create a new class and optionally enroll students
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <h4 className="font-medium">Basic Information</h4>

            <div className="grid gap-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter class name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter class description"
                rows={2}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Class Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    handleInputChange("type", value as "CORPORATE" | "PRIVATE")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="CORPORATE">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleInputChange("level", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CEFR_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxStudents}
                  onChange={(e) =>
                    handleInputChange(
                      "maxStudents",
                      parseInt(e.target.value) || 10
                    )
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={formData.isActive ? "true" : "false"}
                  onValueChange={(value) =>
                    handleInputChange("isActive", value === "true")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule Information */}
          <div className="grid gap-4">
            <h4 className="font-medium flex items-center gap-2">
              <IconCalendar className="h-4 w-4" />
              Schedule
            </h4>

            <div className="grid gap-2">
              <Label>Day of Week *</Label>
              <Select
                value={formData.dayOfWeek.toString()}
                onValueChange={(value) =>
                  handleInputChange("dayOfWeek", parseInt(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Consultant Selection */}
          <div className="grid gap-4">
            <h4 className="font-medium flex items-center gap-2">
              <IconUser className="h-4 w-4" />
              Consultant
            </h4>

            <div className="grid gap-2">
              <Label>Select Consultant</Label>
              <Select
                value={formData.consultantId || "none"}
                onValueChange={(value) =>
                  handleInputChange(
                    "consultantId",
                    value === "none" ? undefined : value
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a consultant..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No consultant</SelectItem>
                  {loadingConsultants ? (
                    <SelectItem value="loading" disabled>
                      Loading consultants...
                    </SelectItem>
                  ) : consultants.length === 0 ? (
                    <SelectItem value="no-consultants" disabled>
                      No consultants found
                    </SelectItem>
                  ) : (
                    consultants.map((consultant) => (
                      <SelectItem key={consultant.id} value={consultant.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {consultant.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {consultant.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Student Selection */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <IconUsers className="h-4 w-4" />
                Students ({selectedStudents.length}/{formData.maxStudents})
              </h4>
              {!showStudentSelection ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStudentSelection(true)}
                  className="gap-1"
                >
                  <IconUserPlus className="h-3 w-3" />
                  Add Students
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStudentSelection(false)}
                  className="gap-1"
                >
                  <IconX className="h-3 w-3" />
                  Hide Selection
                </Button>
              )}
            </div>

            {/* Selected Students */}
            {selectedStudents.length > 0 && (
              <div className="grid gap-2">
                <Label>Selected Students</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((studentId) => {
                    const student = students.find((s) => s.id === studentId);
                    return (
                      <Badge
                        key={studentId}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {student?.fullName || studentId}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeSelectedStudent(studentId)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Student Selection Interface */}
            {showStudentSelection && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <IconSearch className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
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

                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {loadingStudents ? (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        Loading students...
                      </div>
                    ) : availableStudents.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        {searchTerm
                          ? "No students found"
                          : "No students available"}
                      </div>
                    ) : (
                      availableStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center space-x-2 p-2 hover:bg-background rounded-md"
                        >
                          <Checkbox
                            id={student.id}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() =>
                              handleStudentToggle(student.id)
                            }
                            disabled={
                              !selectedStudents.includes(student.id) &&
                              selectedStudents.length >=
                                (formData.maxStudents || 10)
                            }
                          />
                          <label
                            htmlFor={student.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium text-sm">
                              {student.fullName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.email}
                            </div>
                          </label>
                        </div>
                      ))
                    )}
                  </div>

                  {selectedStudents.length >= (formData.maxStudents || 10) && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      Maximum number of students reached (
                      {formData.maxStudents || 10})
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDialogClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
