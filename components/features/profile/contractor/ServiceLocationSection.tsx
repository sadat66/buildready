"use client";

import { FormInput } from "@/components/shared/form-input";
import { MapPin } from "lucide-react";

interface ServiceLocationSectionProps {
  formData: {
    service_location: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function ServiceLocationSection({ formData, onInputChange }: ServiceLocationSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Location</h3>
            <p className="text-sm text-gray-600">Your primary service area and location details</p>
          </div>
        </div>
      </div>
      <div>
        <div>
          <FormInput
            label="Service Location"
            value={formData.service_location}
            onChange={(e) => onInputChange("service_location", e.target.value)}
            placeholder="Enter your primary service location (e.g., Toronto, ON or Greater Toronto Area)"
            containerClassName="space-y-2"
            helperText="Specify the geographic area where you provide services"
          />
        </div>
      </div>
    </div>
  );
}
