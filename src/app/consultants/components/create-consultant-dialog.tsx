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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  createConsultant,
  type CreateConsultantInput,
} from "@/app/consultants/api/create-consultant";

interface CreateConsultantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateConsultantDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateConsultantDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateConsultantInput>({
    email: "",
    password: "",
    fullName: "",
    role: "CONSULTANT", // Default role as consultant
    phone: "",
    birthDate: "",
    address: "",
    emergencyContact: "",
    notes: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 characters";
    }

    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.birthDate = "Birth date must be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const input: CreateConsultantInput = {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        role: "CONSULTANT",
      };

      // Only add optional fields if they have values
      if (formData.phone?.trim()) {
        input.phone = formData.phone.trim();
      }

      if (formData.birthDate) {
        input.birthDate = formData.birthDate;
      }

      if (formData.address?.trim()) {
        input.address = formData.address.trim();
      }

      if (formData.emergencyContact?.trim()) {
        input.emergencyContact = formData.emergencyContact.trim();
      }

      if (formData.notes?.trim()) {
        input.notes = formData.notes.trim();
      }

      await createConsultant(input);

      // Reset form
      setFormData({
        email: "",
        password: "",
        fullName: "",
        role: "CONSULTANT",
        phone: "",
        birthDate: "",
        address: "",
        emergencyContact: "",
        notes: "",
      });
      setErrors({});
      onOpenChange(false);
      onSuccess();

      toast.success(`Consultant "${input.fullName}" created successfully!`);
    } catch (error) {
      console.error("Error creating consultant:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to create consultant",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof CreateConsultantInput, value: any) => {
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
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Add New Consultant
          </DialogTitle>
          <DialogDescription>
            Create a new consultant account with role automatically set to
            consultant.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Basic Information</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                  className={errors.birthDate ? "border-red-500" : ""}
                />
                {errors.birthDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.birthDate}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Contact Information</h4>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Full address..."
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="resize-none min-h-[60px]"
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Emergency contact information"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    updateField("emergencyContact", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the consultant..."
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="resize-none min-h-[80px]"
                />
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
              {isLoading ? "Creating..." : "Create Consultant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
