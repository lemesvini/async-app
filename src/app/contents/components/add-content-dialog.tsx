import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  createContent,
  type CreateContentInput,
} from "@/app/contents/api/get-contents";

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddContentDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddContentDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    module: "A1",
    order: 1,
    presentationUrl: "",
    studentsPdfUrl: "",
    homeworkUrl: "",
    isActive: true,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title is too long (max 200 characters)";
    }

    if (formData.order < 1) {
      newErrors.order = "Order must be at least 1";
    }

    if (formData.presentationUrl && !isValidUrl(formData.presentationUrl)) {
      newErrors.presentationUrl = "Invalid URL";
    }

    if (formData.studentsPdfUrl && !isValidUrl(formData.studentsPdfUrl)) {
      newErrors.studentsPdfUrl = "Invalid URL";
    }

    if (formData.homeworkUrl && !isValidUrl(formData.homeworkUrl)) {
      newErrors.homeworkUrl = "Invalid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const input: CreateContentInput = {
        title: formData.title.trim(),
        module: formData.module,
        order: formData.order,
        isActive: formData.isActive,
      };

      // Only add optional fields if they have values
      if (formData.description.trim()) {
        input.description = formData.description.trim();
      }

      if (formData.presentationUrl.trim()) {
        input.presentationUrl = formData.presentationUrl.trim();
      }

      if (formData.studentsPdfUrl.trim()) {
        input.studentsPdfUrl = formData.studentsPdfUrl.trim();
      }

      if (formData.homeworkUrl.trim()) {
        input.homeworkUrl = formData.homeworkUrl.trim();
      }

      await createContent(input);

      // Reset form
      setFormData({
        title: "",
        description: "",
        module: "A1",
        order: 1,
        presentationUrl: "",
        studentsPdfUrl: "",
        homeworkUrl: "",
        isActive: true,
      });
      setErrors({});
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating content:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to create content",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Content</DialogTitle>
          <DialogDescription>
            Create a new learning content for your students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Title Field */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Introduction to Basic English Greetings"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the content..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="resize-none min-h-[80px]"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Optional description to help students understand the content.
              </p>
            </div>

            {/* Module and Order Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module">Module *</Label>
                <Select
                  value={formData.module}
                  onValueChange={(value) => updateField("module", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1</SelectItem>
                    <SelectItem value="A2">A2</SelectItem>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                    <SelectItem value="C2">C2</SelectItem>
                    <SelectItem value="CONVERSATION_A1">
                      CONVERSATION A1
                    </SelectItem>
                    <SelectItem value="CONVERSATION_A2">
                      CONVERSATION A2
                    </SelectItem>
                    <SelectItem value="CONVERSATION_B1">
                      CONVERSATION B1
                    </SelectItem>
                    <SelectItem value="CONVERSATION_B2">
                      CONVERSATION B2
                    </SelectItem>
                    <SelectItem value="CONVERSATION_C1">
                      CONVERSATION C1
                    </SelectItem>
                    <SelectItem value="CONVERSATION_C2">
                      CONVERSATION C2
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="order">Order *</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) =>
                    updateField("order", parseInt(e.target.value) || 1)
                  }
                  className={errors.order ? "border-red-500" : ""}
                />
                {errors.order && (
                  <p className="text-sm text-red-500 mt-1">{errors.order}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Order within the module (must be unique).
                </p>
              </div>
            </div>

            {/* URL Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="presentationUrl">Presentation URL</Label>
                <Input
                  id="presentationUrl"
                  placeholder="https://example.com/presentation.pptx"
                  value={formData.presentationUrl}
                  onChange={(e) =>
                    updateField("presentationUrl", e.target.value)
                  }
                  className={errors.presentationUrl ? "border-red-500" : ""}
                />
                {errors.presentationUrl && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.presentationUrl}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Optional link to presentation slides.
                </p>
              </div>

              <div>
                <Label htmlFor="studentsPdfUrl">Student PDF URL</Label>
                <Input
                  id="studentsPdfUrl"
                  placeholder="https://example.com/student-materials.pdf"
                  value={formData.studentsPdfUrl}
                  onChange={(e) =>
                    updateField("studentsPdfUrl", e.target.value)
                  }
                  className={errors.studentsPdfUrl ? "border-red-500" : ""}
                />
                {errors.studentsPdfUrl && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.studentsPdfUrl}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Optional link to student materials.
                </p>
              </div>

              <div>
                <Label htmlFor="homeworkUrl">Homework URL</Label>
                <Input
                  id="homeworkUrl"
                  placeholder="https://example.com/homework.pdf"
                  value={formData.homeworkUrl}
                  onChange={(e) => updateField("homeworkUrl", e.target.value)}
                  className={errors.homeworkUrl ? "border-red-500" : ""}
                />
                {errors.homeworkUrl && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.homeworkUrl}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Optional link to homework assignments.
                </p>
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => updateField("isActive", checked)}
                className="mt-0.5"
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Content will be visible to students when active.
                </p>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md">
              {errors.submit}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Content"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
