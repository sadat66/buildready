"use client";

import { FormInput, FormTextarea } from "@/components/shared/form-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, MapPin, FileText, Shield } from "lucide-react";
import { ExtendedUser } from "@/contexts/AuthContext";

interface PersonalInfoSectionProps {
  formData: {
    full_name: string;
    phone: string;
    location: string;
    bio: string;
  };
  user: ExtendedUser;
  onInputChange: (field: string, value: string) => void;
}

export function PersonalInfoSection({ formData, user, onInputChange }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <p className="text-sm text-gray-600">Your account details and contact information</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormInput
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => onInputChange("full_name", e.target.value)}
              placeholder="Enter your full name"
              containerClassName="space-y-2"
            />
          </div>

          <div>
            <FormInput
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
              placeholder="Enter your phone number"
              containerClassName="space-y-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            Email Address
          </Label>
          <Input 
            id="email" 
            type="email" 
            value={user?.email || ""} 
            disabled 
            className="bg-gray-50 border-gray-200 text-gray-600"
          />
          <p className="text-xs text-gray-500 flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Email address cannot be changed for security reasons
          </p>
        </div>

        <div>
          <FormInput
            label="Primary Service Area"
            value={formData.location}
            onChange={(e) => onInputChange("location", e.target.value)}
            placeholder="Enter your primary service area or location"
            containerClassName="space-y-2"
          />
        </div>

        <div>
          <FormTextarea
            label="Professional Bio"
            value={formData.bio}
            onChange={(e) => onInputChange("bio", e.target.value)}
            placeholder="Describe your experience, expertise, and what sets you apart..."
            rows={4}
            helperText="This will be visible to potential clients"
            containerClassName="space-y-2"
          />
        </div>
      </div>
    </div>
  );
}
