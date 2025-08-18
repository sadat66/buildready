"use client";

import { FormInput } from "@/components/shared/form-input";
import { MapPin, Building2, Mail } from "lucide-react";

interface ServiceLocationSectionProps {
  formData: {
    service_location: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function ServiceLocationSection({ formData, onInputChange }: ServiceLocationSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Service Location</h3>
            <p className="text-sm text-slate-600">Your primary service area and location details</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div>
          <FormInput
            label="Service Location"
            value={formData.service_location}
            onChange={(e) => onInputChange("service_location", e.target.value)}
            placeholder="Enter your primary service location (e.g., Toronto, ON or Greater Toronto Area)"
            className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
            containerClassName="space-y-2"
            helperText="Specify the geographic area where you provide services"
          />
        </div>
      </div>
    </div>
  );
}
