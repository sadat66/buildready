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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
            <p className="text-sm text-slate-600">Your account details and contact information</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormInput
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => onInputChange("full_name", e.target.value)}
              placeholder="Enter your full name"
              className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
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
              className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
              containerClassName="space-y-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center">
            <Mail className="h-4 w-4 mr-2 text-slate-500" />
            Email Address
          </Label>
          <Input 
            id="email" 
            type="email" 
            value={user?.email || ""} 
            disabled 
            className="bg-slate-50 border-slate-200 text-slate-600"
          />
          <p className="text-xs text-slate-500 flex items-center">
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
            className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
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
            className="border-slate-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
            helperText="This will be visible to potential clients"
            containerClassName="space-y-2"
          />
        </div>
      </div>
    </div>
  );
}
