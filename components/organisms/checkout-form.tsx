import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  isSubmitting?: boolean;
  error?: Error | null;
  className?: string;
  initialData?: Partial<CheckoutFormData>;
}

const CheckoutForm = React.forwardRef<HTMLFormElement, CheckoutFormProps>(
  ({
    onSubmit,
    isSubmitting = false,
    error = null,
    className,
    initialData = {},
    ...props
  }, ref) => {
    const [formData, setFormData] = React.useState<CheckoutFormData>({
      email: initialData.email || "",
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      address: initialData.address || "",
      city: initialData.city || "",
      state: initialData.state || "",
      zipCode: initialData.zipCode || "",
      phone: initialData.phone || "",
    });

    const [errors, setErrors] = React.useState<Partial<CheckoutFormData>>({});
    const [touched, setTouched] = React.useState<Partial<Record<keyof CheckoutFormData, boolean>>>({});

    const handleInputChange = (field: keyof CheckoutFormData) => (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

    const handleInputBlur = (field: keyof CheckoutFormData) => () => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, formData[field] || "");
    };

    const validateField = (field: keyof CheckoutFormData, value: string) => {
      let error = "";

      switch (field) {
        case "email":
          if (!value.trim()) {
            error = "Email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = "Please enter a valid email address";
          }
          break;
        case "firstName":
          if (!value.trim()) {
            error = "First name is required";
          }
          break;
        case "lastName":
          if (!value.trim()) {
            error = "Last name is required";
          }
          break;
        case "address":
          if (!value.trim()) {
            error = "Address is required";
          }
          break;
        case "city":
          if (!value.trim()) {
            error = "City is required";
          }
          break;
        case "state":
          if (!value.trim()) {
            error = "State is required";
          }
          break;
        case "zipCode":
          if (!value.trim()) {
            error = "ZIP code is required";
          } else if (!/^\d{5}(-\d{4})?$/.test(value)) {
            error = "Please enter a valid ZIP code";
          }
          break;
        case "phone":
          if (value && !/^[\d\s\-\(\)\+]+$/.test(value)) {
            error = "Please enter a valid phone number";
          }
          break;
      }

      setErrors(prev => ({ ...prev, [field]: error || undefined }));
      return !error;
    };

    const validateForm = () => {
      const requiredFields: (keyof CheckoutFormData)[] = [
        "email", "firstName", "lastName", "address", "city", "state", "zipCode"
      ];

      let isValid = true;
      const newErrors: Partial<CheckoutFormData> = {};

      requiredFields.forEach(field => {
        if (!validateField(field, formData[field] || "")) {
          isValid = false;
        }
      });

      // Validate optional phone if provided
      if (formData.phone && !validateField("phone", formData.phone || "")) {
        isValid = false;
      }

      // Mark all fields as touched
      const allTouched = requiredFields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<keyof CheckoutFormData, boolean>);
      setTouched(allTouched);

      return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (validateForm()) {
        onSubmit(formData);
      }
    };

    const getFieldError = (field: keyof CheckoutFormData) => {
      return touched[field] && errors[field];
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn("space-y-6", className)}
        {...props}
      >
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error.message || "An error occurred during checkout. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                onBlur={handleInputBlur("email")}
                disabled={isSubmitting}
                className={getFieldError("email") ? "border-destructive" : ""}
                placeholder="your@email.com"
              />
              {getFieldError("email") && (
                <p className="text-sm text-destructive mt-1">
                  {getFieldError("email")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  onBlur={handleInputBlur("firstName")}
                  disabled={isSubmitting}
                  className={getFieldError("firstName") ? "border-destructive" : ""}
                  placeholder="John"
                />
                {getFieldError("firstName") && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError("firstName")}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
                  onBlur={handleInputBlur("lastName")}
                  disabled={isSubmitting}
                  className={getFieldError("lastName") ? "border-destructive" : ""}
                  placeholder="Doe"
                />
                {getFieldError("lastName") && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError("lastName")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                onBlur={handleInputBlur("phone")}
                disabled={isSubmitting}
                className={getFieldError("phone") ? "border-destructive" : ""}
                placeholder="(555) 123-4567"
              />
              {getFieldError("phone") && (
                <p className="text-sm text-destructive mt-1">
                  {getFieldError("phone")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange("address")}
                onBlur={handleInputBlur("address")}
                disabled={isSubmitting}
                className={getFieldError("address") ? "border-destructive" : ""}
                placeholder="123 Main Street"
              />
              {getFieldError("address") && (
                <p className="text-sm text-destructive mt-1">
                  {getFieldError("address")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange("city")}
                  onBlur={handleInputBlur("city")}
                  disabled={isSubmitting}
                  className={getFieldError("city") ? "border-destructive" : ""}
                  placeholder="New York"
                />
                {getFieldError("city") && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError("city")}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={handleInputChange("state")}
                  onBlur={handleInputBlur("state")}
                  disabled={isSubmitting}
                  className={getFieldError("state") ? "border-destructive" : ""}
                  placeholder="NY"
                />
                {getFieldError("state") && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError("state")}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={handleInputChange("zipCode")}
                  onBlur={handleInputBlur("zipCode")}
                  disabled={isSubmitting}
                  className={getFieldError("zipCode") ? "border-destructive" : ""}
                  placeholder="10001"
                />
                {getFieldError("zipCode") && (
                  <p className="text-sm text-destructive mt-1">
                    {getFieldError("zipCode")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing Order...
              </>
            ) : (
              "Complete Order"
            )}
          </Button>
        </div>
      </form>
    );
  }
);
CheckoutForm.displayName = "CheckoutForm";

export { CheckoutForm };
export type { CheckoutFormProps, CheckoutFormData };