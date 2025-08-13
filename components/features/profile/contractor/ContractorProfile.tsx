"use client";

// Removed card imports - using simple sections instead
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Save, ArrowLeft, Briefcase, Award, Building2, Shield, MapPin, Phone, Mail, FileText, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";

interface ContractorProfileProps {
  user: any;
}

export function ContractorProfile({ user }: ContractorProfileProps) {
  const [, setUserData] = useState<{
    full_name: string;
    phone: string;
    location: string;
    bio: string;
    business_name?: string;
    company_name?: string;
    license_number?: string;
    years_experience?: number;
    specialties?: string[];
    trade_category?: string[];
    portfolio?: string[];
    logo?: string;
    licenses?: string[];
    legal_entity_type?: string;
    gst_hst_number?: string;
    wcb_number?: string;
    insurance_general_liability?: number;
    insurance_builders_risk?: number;
    insurance_expiry_date?: string;
    insurance_proof_upload?: string;
    insurance_is_verified?: boolean;
    work_guarantee_months?: number;
    contractor_contacts?: Array<{
      name: string;
      role: string;
      email: string;
      phone: string;
    }>;
    service_address?: string;
    service_city?: string;
    service_province?: string;
    service_postal_code?: string;
    service_country?: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    bio: "",
    business_name: "",
    company_name: "",
    license_number: "",
    years_experience: 0,
    specialties: [] as string[],
    trade_category: [] as string[],
    portfolio: [] as string[],
    logo: "",
    licenses: [] as string[],
    legal_entity_type: "",
    gst_hst_number: "",
    wcb_number: "",
    insurance_general_liability: 0,
    insurance_builders_risk: 0,
    insurance_expiry_date: "",
    insurance_proof_upload: "",
    insurance_is_verified: false,
    work_guarantee_months: 12,
    contractor_contacts: [] as Array<{
      name: string;
      role: string;
      email: string;
      phone: string;
    }>,
    service_address: "",
    service_city: "",
    service_province: "",
    service_postal_code: "",
    service_country: "Canada",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setUserData(data);
        setFormData({
          full_name: data?.full_name || "",
          phone: data?.phone || "",
          location: data?.location || "",
          bio: data?.bio || "",
          business_name: data?.business_name || "",
          company_name: data?.company_name || "",
          license_number: data?.license_number || "",
          years_experience: data?.years_experience || 0,
          specialties: data?.specialties || [],
          trade_category: data?.trade_category || [],
          portfolio: data?.portfolio || [],
          logo: data?.logo || "",
          licenses: data?.licenses || [],
          legal_entity_type: data?.legal_entity_type || "",
          gst_hst_number: data?.gst_hst_number || "",
          wcb_number: data?.wcb_number || "",
          insurance_general_liability: data?.insurance_general_liability || 0,
          insurance_builders_risk: data?.insurance_builders_risk || 0,
          insurance_expiry_date: data?.insurance_expiry_date || "",
          insurance_proof_upload: data?.insurance_proof_upload || "",
          insurance_is_verified: data?.insurance_is_verified || false,
          work_guarantee_months: data?.work_guarantee_months || 12,
          contractor_contacts: data?.contractor_contacts || [],
          service_address: data?.service_address || "",
          service_city: data?.service_city || "",
          service_province: data?.service_province || "",
          service_postal_code: data?.service_postal_code || "",
          service_country: data?.service_country || "Canada",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (field: string, value: string | number | string[] | boolean | Array<{name: string; role: string; email: string; phone: string;}>) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecialtiesChange = (value: string) => {
    const specialties = value.split(",").map((s) => s.trim()).filter(Boolean);
    handleInputChange("specialties", specialties);
  };

  const handleTradeCategoryChange = (value: string) => {
    const categories = value.split(",").map((s) => s.trim()).filter(Boolean);
    handleInputChange("trade_category", categories);
  };

  const handlePortfolioChange = (value: string) => {
    const urls = value.split(",").map((s) => s.trim()).filter(Boolean);
    handleInputChange("portfolio", urls);
  };

  const handleLicensesChange = (value: string) => {
    const licenses = value.split(",").map((s) => s.trim()).filter(Boolean);
    handleInputChange("licenses", licenses);
  };

  const addContact = () => {
    const newContact = { name: "", role: "", email: "", phone: "" };
    handleInputChange("contractor_contacts", [...formData.contractor_contacts, newContact]);
  };

  const removeContact = (index: number) => {
    const updatedContacts = formData.contractor_contacts.filter((_, i) => i !== index);
    handleInputChange("contractor_contacts", updatedContacts);
  };

  const updateContact = (index: number, field: string, value: string) => {
     const updatedContacts = formData.contractor_contacts.map((contact, i) => 
       i === index ? { ...contact, [field]: value } : contact
     );
     handleInputChange("contractor_contacts", updatedContacts);
   };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Sanitize formData to handle empty date fields
      const sanitizedData = {
        ...formData,
        insurance_expiry_date: formData.insurance_expiry_date || null,
      };
      
      const supabase = createClient();
      const { error } = await supabase
        .from("users")
        .update(sanitizedData)
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      setUserData((prev) => (prev ? { ...prev, ...formData } : null));
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMessage = "Unknown error occurred";
      
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if ('details' in error && typeof error.details === 'string') {
          errorMessage = error.details;
        } else if ('hint' in error && typeof error.hint === 'string') {
          errorMessage = error.hint;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(`Failed to update profile: ${errorMessage}`);
      console.log("Detailed error:", JSON.stringify(error, null, 2));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/contractor/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Contractor Profile</h1>
                <p className="text-slate-600 mt-1">Manage your professional account and business information</p>
              </div>
            </div>
            <Link href="/contractor/dashboard">
              <Button variant="outline" size="sm" className="hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Personal & Business Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-semibold text-slate-700 flex items-center">
                      <User className="h-4 w-4 mr-2 text-slate-500" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-500" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold text-slate-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                    Primary Service Area
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Enter your primary service area or location"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-semibold text-slate-700 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-slate-500" />
                    Professional Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Describe your experience, expertise, and what sets you apart..."
                    rows={4}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-slate-500">This will be visible to potential clients</p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Business Information</h3>
                    <p className="text-sm text-slate-600">Your company and professional details</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business_name" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-slate-500" />
                      Business Name
                    </Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => handleInputChange("business_name", e.target.value)}
                      placeholder="Enter your legal or trade business name"
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-sm font-semibold text-slate-700">
                      Company Name (Alternative)
                    </Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      placeholder="Enter your company name"
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="license_number" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-slate-500" />
                      License Number
                    </Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange("license_number", e.target.value)}
                      placeholder="Enter your license number"
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                      Years of Experience
                    </Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={(e) => handleInputChange("years_experience", parseInt(e.target.value) || 0)}
                      placeholder="Enter years of experience"
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
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
                      onChange={(e) => handleTradeCategoryChange(e.target.value)}
                      placeholder="Enter primary/secondary trade categories (e.g., General Contractor, Electrical, Plumbing)"
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500">Separate multiple categories with commas</p>
                    {formData.trade_category.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.trade_category.map((category, index) => (
                          <Badge key={index} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialties" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-slate-500" />
                      Specialties
                    </Label>
                    <Input
                      id="specialties"
                      value={formData.specialties.join(", ")}
                      onChange={(e) => handleSpecialtiesChange(e.target.value)}
                      placeholder="Enter specialties separated by commas (e.g., Plumbing, Electrical, HVAC)"
                      className="border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500">Separate multiple specialties with commas</p>
                    {formData.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            {specialty}
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
              onChange={(e) => handlePortfolioChange(e.target.value)}
              placeholder="Enter portfolio/project image URLs separated by commas"
            />
            <p className="text-sm text-gray-500">Separate multiple URLs with commas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo URL</Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => handleInputChange("logo", e.target.value)}
              placeholder="Enter URL for your company logo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenses">License File URLs</Label>
            <Input
              id="licenses"
              value={formData.licenses.join(", ")}
              onChange={(e) => handleLicensesChange(e.target.value)}
              placeholder="Enter license file URLs separated by commas"
            />
            <p className="text-sm text-gray-500">Separate multiple license URLs with commas</p>
          </div>


              </div>
            </div>

            {/* Service Location */}
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
                onChange={(e) => handleInputChange("service_address", e.target.value)}
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
                onChange={(e) => handleInputChange("service_city", e.target.value)}
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
                onChange={(e) => handleInputChange("service_province", e.target.value)}
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
                onChange={(e) => handleInputChange("service_postal_code", e.target.value)}
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
                onChange={(e) => handleInputChange("service_country", e.target.value)}
                placeholder="Enter country"
                className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
                </div>
              </div>
            </div>

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
              onChange={(e) => handleInputChange("legal_entity_type", e.target.value)}
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
                onChange={(e) => handleInputChange("gst_hst_number", e.target.value)}
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
                onChange={(e) => handleInputChange("wcb_number", e.target.value)}
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
              onChange={(e) => handleInputChange("work_guarantee_months", parseInt(e.target.value) || 0)}
              placeholder="Enter guarantee period in months"
              className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
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
                onChange={(e) => handleInputChange("insurance_general_liability", parseInt(e.target.value) || 0)}
                placeholder="Enter coverage amount in CAD"
                className="border-slate-300 focus:border-green-500 focus:ring-green-500"
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
                onChange={(e) => handleInputChange("insurance_builders_risk", parseInt(e.target.value) || 0)}
                placeholder="Enter coverage amount in CAD"
                className="border-slate-300 focus:border-green-500 focus:ring-green-500"
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
                onChange={(e) => handleInputChange("insurance_expiry_date", e.target.value)}
                className="border-slate-300 focus:border-green-500 focus:ring-green-500"
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
                onChange={(e) => handleInputChange("insurance_proof_upload", e.target.value)}
                placeholder="Enter URL to proof of insurance file"
                className="border-slate-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              id="insurance_is_verified"
              checked={formData.insurance_is_verified}
              onChange={(e) => handleInputChange("insurance_is_verified", e.target.checked)}
              className="rounded border-green-300 text-green-600 focus:ring-green-500"
            />
            <Label htmlFor="insurance_is_verified" className="flex items-center space-x-2 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Insurance is verified</span>
            </Label>
                </div>
              </div>
            </div>

            {/* Contact Management */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Contractor Contacts</h3>
                    <p className="text-sm text-slate-600">Manage your team contacts and roles</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
          {formData.contractor_contacts.map((contact, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-6 space-y-4 bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-slate-800 flex items-center space-x-2">
                  <User className="h-4 w-4 text-indigo-600" />
                  <span>Contact {index + 1}</span>
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeContact(index)}
                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>Name</span>
                  </Label>
                  <Input
                    value={contact.name}
                    onChange={(e) => updateContact(index, "name", e.target.value)}
                    placeholder="Enter contact name"
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    <span>Role</span>
                  </Label>
                  <Input
                    value={contact.role}
                    onChange={(e) => updateContact(index, "role", e.target.value)}
                    placeholder="Enter role/position"
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span>Email</span>
                  </Label>
                  <Input
                    type="email"
                    value={contact.email}
                    onChange={(e) => updateContact(index, "email", e.target.value)}
                    placeholder="Enter email address"
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span>Phone</span>
                  </Label>
                  <Input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, "phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addContact}
            className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Add Contact</span>
          </Button>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Account Summary</h3>
                    <p className="text-sm text-slate-600">Your contractor account details</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <User className="h-4 w-4 text-slate-500" />
                <span>Account Type</span>
              </Label>
              <div className="text-sm text-slate-900 font-semibold capitalize flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Contractor</Badge>
              </div>
            </div>
            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>Member Since</span>
              </Label>
              <p className="text-sm text-slate-900 font-semibold">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
                </div>
              </div>
            </div>

      {/* Save Button */}
      <div className="flex justify-end pt-8">
        <Button
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-5 w-5" />
          <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
        </Button>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}