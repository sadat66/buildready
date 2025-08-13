"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Building2, FileText, CheckCircle, Calendar } from "lucide-react";

interface InsuranceSectionProps {
  formData: {
    legal_entity_type: string;
    gst_hst_number: string;
    wcb_number: string;
    work_guarantee_months: number;
    insurance_general_liability: number;
    insurance_builders_risk: number;
    insurance_expiry_date: string;
    insurance_proof_upload: string;
    insurance_is_verified: boolean;
  };
  onInputChange: (field: string, value: string | number | boolean) => void;
}

export function InsuranceSection({ formData, onInputChange }: InsuranceSectionProps) {
  return (
    <>
      {/* Legal Information */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Legal & Compliance Information</h3>
              <p className="text-sm text-slate-600">Legal entity details and compliance information</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="legal_entity_type" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>Legal Entity Type</span>
            </Label>
            <Input
              id="legal_entity_type"
              value={formData.legal_entity_type}
              onChange={(e) => onInputChange("legal_entity_type", e.target.value)}
              placeholder="e.g., Corporation, Partnership, Sole Proprietorship"
              className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gst_hst_number" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <FileText className="h-4 w-4 text-slate-500" />
                <span>GST/HST Number</span>
              </Label>
              <Input
                id="gst_hst_number"
                value={formData.gst_hst_number}
                onChange={(e) => onInputChange("gst_hst_number", e.target.value)}
                placeholder="Enter your CRA GST/HST number"
                className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wcb_number" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <Shield className="h-4 w-4 text-slate-500" />
                <span>WCB Number</span>
              </Label>
              <Input
                id="wcb_number"
                value={formData.wcb_number}
                onChange={(e) => onInputChange("wcb_number", e.target.value)}
                placeholder="Enter Workers' Compensation Board number"
                className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="work_guarantee_months" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
              <CheckCircle className="h-4 w-4 text-slate-500" />
              <span>Work Guarantee (Months)</span>
            </Label>
            <Input
              id="work_guarantee_months"
              type="number"
              min="0"
              value={formData.work_guarantee_months}
              onChange={(e) => onInputChange("work_guarantee_months", parseInt(e.target.value) || 0)}
              placeholder="Enter guarantee period in months"
              className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Insurance Information</h3>
              <p className="text-sm text-slate-600">Insurance coverage and verification details</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="insurance_general_liability" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <Shield className="h-4 w-4 text-slate-500" />
                <span>General Liability (CAD)</span>
              </Label>
              <Input
                id="insurance_general_liability"
                type="number"
                min="0"
                value={formData.insurance_general_liability}
                onChange={(e) => onInputChange("insurance_general_liability", parseInt(e.target.value) || 0)}
                placeholder="Enter coverage amount in CAD"
                className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance_builders_risk" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span>Builders Risk (CAD)</span>
              </Label>
              <Input
                id="insurance_builders_risk"
                type="number"
                min="0"
                value={formData.insurance_builders_risk}
                onChange={(e) => onInputChange("insurance_builders_risk", parseInt(e.target.value) || 0)}
                placeholder="Enter coverage amount in CAD"
                className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="insurance_expiry_date" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>Insurance Expiry Date</span>
              </Label>
              <Input
                id="insurance_expiry_date"
                type="date"
                value={formData.insurance_expiry_date}
                onChange={(e) => onInputChange("insurance_expiry_date", e.target.value)}
                className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance_proof_upload" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <FileText className="h-4 w-4 text-slate-500" />
                <span>Proof of Insurance URL</span>
              </Label>
              <Input
                id="insurance_proof_upload"
                value={formData.insurance_proof_upload}
                onChange={(e) => onInputChange("insurance_proof_upload", e.target.value)}
                placeholder="Enter URL to proof of insurance file"
                className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <input
              type="checkbox"
              id="insurance_is_verified"
              checked={formData.insurance_is_verified}
              onChange={(e) => onInputChange("insurance_is_verified", e.target.checked)}
              className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="insurance_is_verified" className="flex items-center space-x-2 text-sm font-medium text-orange-700">
              <CheckCircle className="h-4 w-4" />
              <span>Insurance is verified</span>
            </Label>
          </div>
        </div>
      </div>
    </>
  );
}
