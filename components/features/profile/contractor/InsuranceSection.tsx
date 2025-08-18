"use client";

import { FormInput, FormSelect } from "@/components/shared/form-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Building2, FileText, CheckCircle, Calendar } from "lucide-react";

interface InsuranceSectionProps {
  formData: {
    legal_entity_type: string;
    gst_hst_number: string;
    wcb_number: string;
    work_guarantee: number;
    insurance_general_liability: number;
    insurance_builders_risk: number;
    insurance_expiry: string;
    insurance_upload: string;
    is_insurance_verified: boolean;
  };
  onInputChange: (field: string, value: string | number | boolean) => void;
}

export function InsuranceSection({ formData, onInputChange }: InsuranceSectionProps) {
  return (
    <>
      {/* Legal Information */}
      <div className="space-y-4">
        <div className="border-b pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Legal & Compliance Information</h3>
              <p className="text-sm text-gray-600">Legal entity details and compliance information</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <FormSelect
              label="Legal Entity Type"
              placeholder="Select legal entity type"
              value={formData.legal_entity_type}
              onValueChange={(value) => onInputChange("legal_entity_type", value)}
              options={[
                { value: "Corporation", label: "Corporation" },
                { value: "Partnership", label: "Partnership" },
                { value: "Sole Proprietorship", label: "Sole Proprietorship" },
                { value: "LLC", label: "LLC" }
              ]}
              containerClassName="space-y-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="GST/HST Number"
                value={formData.gst_hst_number}
                onChange={(e) => onInputChange("gst_hst_number", e.target.value)}
                placeholder="Enter your CRA GST/HST number"
                containerClassName="space-y-2"
              />
            </div>
            <div>
              <FormInput
                label="WCB Number"
                value={formData.wcb_number}
                onChange={(e) => onInputChange("wcb_number", e.target.value)}
                placeholder="Enter Workers' Compensation Board number"
                containerClassName="space-y-2"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="work_guarantee" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <span>Work Guarantee (Months)</span>
            </Label>
            <Input
              id="work_guarantee"
              type="number"
              min="0"
              value={formData.work_guarantee}
              onChange={(e) => onInputChange("work_guarantee", parseInt(e.target.value) || 0)}
              placeholder="Enter guarantee period in months"
            />
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <div className="border-b pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
              <p className="text-sm text-gray-600">Insurance coverage and verification details</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="General Liability (CAD)"
                type="number"
                min="0"
                value={formData.insurance_general_liability}
                onChange={(e) => onInputChange("insurance_general_liability", parseInt(e.target.value) || 0)}
                placeholder="Enter coverage amount in CAD"
                containerClassName="space-y-2"
              />
            </div>
            <div>
              <FormInput
                label="Builders Risk (CAD)"
                type="number"
                min="0"
                value={formData.insurance_builders_risk}
                onChange={(e) => onInputChange("insurance_builders_risk", parseInt(e.target.value) || 0)}
                placeholder="Enter coverage amount in CAD"
                containerClassName="space-y-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Insurance Expiry Date"
                type="date"
                value={formData.insurance_expiry}
                onChange={(e) => onInputChange("insurance_expiry", e.target.value)}
                containerClassName="space-y-2"
              />
            </div>
            <div>
              <FormInput
                label="Proof of Insurance URL"
                value={formData.insurance_upload}
                onChange={(e) => onInputChange("insurance_upload", e.target.value)}
                placeholder="Enter URL to proof of insurance file"
                containerClassName="space-y-2"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border">
            <input
              type="checkbox"
              id="is_insurance_verified"
              checked={formData.is_insurance_verified}
              onChange={(e) => onInputChange("is_insurance_verified", e.target.checked)}
            />
            <Label htmlFor="is_insurance_verified" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <CheckCircle className="h-4 w-4" />
              <span>Insurance is verified</span>
            </Label>
          </div>
        </div>
      </div>
    </>
  );
}
