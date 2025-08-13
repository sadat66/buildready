"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Save, ArrowLeft, Building2, Award, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { InsuranceSection } from "./InsuranceSection";
import { ContactManagementSection } from "./ContactManagementSection";
import { ServiceLocationSection } from "./ServiceLocationSection";
import { Label } from "@/components/ui/label";

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
              <span className="hidden sm:inline">Back to Dashboard</span>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
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
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>

                <div className="space-y-6">
          <PersonalInfoSection 
            formData={formData} 
            user={user} 
            onInputChange={handleInputChange} 
          />

                      <BusinessInfoSection 
            formData={formData}
            onInputChange={handleInputChange}
            onSpecialtiesChange={handleSpecialtiesChange}
            onTradeCategoryChange={handleTradeCategoryChange}
            onPortfolioChange={handlePortfolioChange}
            onLicensesChange={handleLicensesChange}
          />

                      <ServiceLocationSection 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <InsuranceSection 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <ContactManagementSection 
            contractor_contacts={formData.contractor_contacts}
            onAddContact={addContact}
            onRemoveContact={removeContact}
            onUpdateContact={updateContact}
          />

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
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">Contractor</Badge>
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
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
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
  );
}