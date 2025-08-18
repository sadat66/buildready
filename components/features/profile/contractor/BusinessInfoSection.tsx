"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, Shield, Calendar, Award } from "lucide-react";

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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Business Information</h3>
            <p className="text-sm text-slate-600">Your company and professional details</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="business_name" className="text-sm font-semibold text-slate-700 flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-slate-500" />
            Business Name
          </Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => onInputChange("business_name", e.target.value)}
            placeholder="Enter your legal or trade business name"
            className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo" className="text-sm font-semibold text-slate-700 flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-slate-500" />
            Company Logo URL
          </Label>
          <Input
            id="logo"
            value={formData.logo}
            onChange={(e) => onInputChange("logo", e.target.value)}
            placeholder="Enter your company logo URL"
            className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trade_category" className="text-sm font-semibold text-slate-700 flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
              Trade Categories
            </Label>
            <Input
              id="trade_category"
              value={formData.trade_category.join(", ")}
              onChange={(e) => onTradeCategoryChange(e.target.value)}
              placeholder="Enter primary/secondary trade categories (e.g., General Contractor, Electrical, Plumbing)"
              className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
            />
            <p className="text-xs text-slate-500">Separate multiple categories with commas</p>
            {formData.trade_category.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.trade_category.map((category, index) => (
                  <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          </div>


        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio URLs</Label>
          <Input
            id="portfolio"
            value={formData.portfolio.join(", ")}
            onChange={(e) => onPortfolioChange(e.target.value)}
            placeholder="Enter portfolio/project image URLs separated by commas"
            className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
          />
          <p className="text-sm text-gray-500">Separate multiple URLs with commas</p>
        </div>



        <div className="space-y-2">
          <Label htmlFor="licenses">License File URLs</Label>
          <Input
            id="licenses"
            value={formData.licenses.join(", ")}
            onChange={(e) => onLicensesChange(e.target.value)}
            placeholder="Enter license file URLs separated by commas"
            className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
          />
          <p className="text-sm text-gray-500">Separate multiple license URLs with commas</p>
        </div>
      </div>
    </div>
  );
}
