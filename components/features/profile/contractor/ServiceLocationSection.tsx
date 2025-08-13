"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Building2, Mail } from "lucide-react";

interface ServiceLocationSectionProps {
  formData: {
    service_address: string;
    service_city: string;
    service_province: string;
    service_postal_code: string;
    service_country: string;
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
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="service_address" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span>Service Address</span>
            </Label>
            <Input
              id="service_address"
              value={formData.service_address}
              onChange={(e) => onInputChange("service_address", e.target.value)}
              placeholder="Enter your service address"
              className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_city" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>City</span>
            </Label>
            <Input
              id="service_city"
              value={formData.service_city}
              onChange={(e) => onInputChange("service_city", e.target.value)}
              placeholder="Enter your service city"
              className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="service_province" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span>Province</span>
            </Label>
            <Input
              id="service_province"
              value={formData.service_province}
              onChange={(e) => onInputChange("service_province", e.target.value)}
              placeholder="Enter your province"
              className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_postal_code" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>Postal Code</span>
            </Label>
            <Input
              id="service_postal_code"
              value={formData.service_postal_code}
              onChange={(e) => onInputChange("service_postal_code", e.target.value)}
              placeholder="Enter postal code"
              className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_country" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>Country</span>
            </Label>
            <Input
              id="service_country"
              value={formData.service_country}
              onChange={(e) => onInputChange("service_country", e.target.value)}
              placeholder="Enter country"
              className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
