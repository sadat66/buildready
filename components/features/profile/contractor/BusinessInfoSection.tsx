"use client";

import { FormInput } from "@/components/shared/form-input";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

interface BusinessInfoSectionProps {
  formData: {
    business_name: string;
    trade_category: string[];
    portfolio: string[];
    logo: string;
    licenses: string[];
  };
  onInputChange: (field: string, value: string | number | string[]) => void;
  onTradeCategoryChange: (value: string) => void;
  onPortfolioChange: (value: string) => void;
  onLicensesChange: (value: string) => void;
}

export function BusinessInfoSection({ 
  formData, 
  onInputChange, 
  onTradeCategoryChange, 
  onPortfolioChange, 
  onLicensesChange 
}: BusinessInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
            <p className="text-sm text-gray-600">Your company and professional details</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <FormInput
            label="Business Name"
            value={formData.business_name}
            onChange={(e) => onInputChange("business_name", e.target.value)}
            placeholder="Enter your legal or trade business name"
            containerClassName="space-y-2"
          />
        </div>

        <div>
          <FormInput
            label="Company Logo URL"
            value={formData.logo}
            onChange={(e) => onInputChange("logo", e.target.value)}
            placeholder="Enter your company logo URL"
            containerClassName="space-y-2"
          />
        </div>
        <div className="space-y-4">
          <div>
            <FormInput
              label="Trade Categories"
              value={formData.trade_category.join(", ")}
              onChange={(e) => onTradeCategoryChange(e.target.value)}
              placeholder="Enter primary/secondary trade categories (e.g., General Contractor, Electrical, Plumbing)"
              helperText="Separate multiple categories with commas"
              containerClassName="space-y-2"
            />
            {formData.trade_category.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.trade_category.map((category, index) => (
                  <Badge key={index} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>


        </div>

        <div>
          <FormInput
            label="Portfolio URLs"
            value={formData.portfolio.join(", ")}
            onChange={(e) => onPortfolioChange(e.target.value)}
            placeholder="Enter portfolio/project image URLs separated by commas"
            helperText="Separate multiple URLs with commas"
            containerClassName="space-y-2"
          />
        </div>



        <div>
          <FormInput
            label="License File URLs"
            value={formData.licenses.join(", ")}
            onChange={(e) => onLicensesChange(e.target.value)}
            placeholder="Enter license file URLs separated by commas"
            className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
            helperText="Separate multiple license URLs with commas"
            containerClassName="space-y-2"
          />
        </div>
      </div>
    </div>
  );
}
