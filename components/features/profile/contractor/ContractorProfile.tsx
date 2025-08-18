"use client";

import { Button } from "@/components/ui/button";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { ExtendedUser } from "@/contexts/AuthContext";

// Import modular components
import { PersonalInfoSection } from "./PersonalInfoSection";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { InsuranceSection } from "./InsuranceSection";
import { ContactManagementSection } from "./ContactManagementSection";
import { ServiceLocationSection } from "./ServiceLocationSection";

interface ContractorProfileProps {
  user: ExtendedUser;
}

export function ContractorProfile({ user }: ContractorProfileProps) {
  // Ensure user is authenticated
  if (!user?.id) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card text-card-foreground">
          <div className="p-6">
            <div className="text-center">Authentication required. Please sign in.</div>
          </div>
        </div>
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // User profile data (basic user info)
  const [userFormData, setUserFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
  });

  // Contractor profile data (business info) - aligned with database schema
  const [contractorFormData, setContractorFormData] = useState({
    business_name: "",
    bio: "",
    legal_entity_type: "" as "Corporation" | "Partnership" | "Sole Proprietorship" | "LLC" | "",
    gst_hst_number: "",
    wcb_number: "",
    service_location: "",
    trade_category: [] as string[],
    phone_number: "",
    logo: "",
    portfolio: [] as string[],
    licenses: [] as string[],
    insurance_general_liability: 0,
    insurance_builders_risk: 0,
    insurance_expiry: "",
    insurance_upload: "",
    work_guarantee: 0,
    contractor_contacts: [] as string[],
  });

  // State for profile data
  const [userProfile, setUserProfile] = useState<any>(null);
  const [contractorProfile, setContractorProfile] = useState<any>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [contractorError, setContractorError] = useState<string | null>(null);

  // Fetch user and contractor profile data using Supabase
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        const supabase = createClient();
        
        // Fetch user profile
        const { data: userData, error: userErr } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userErr) {
          console.error("Error fetching user data:", userErr);
          setUserError(userErr.message);
        } else {
          setUserProfile(userData);
          setUserError(null);
        }

        // Fetch contractor profile
        const { data: contractorData, error: contractorErr } = await supabase
          .from("contractor_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (contractorErr) {
          if (contractorErr.code === 'PGRST116') {
            // No contractor profile found, this is okay
            setContractorProfile(null);
            setContractorError(null);
          } else {
            console.error("Error fetching contractor data:", contractorErr);
            setContractorError(contractorErr.message);
          }
        } else {
          setContractorProfile(contractorData);
          setContractorError(null);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  useEffect(() => {
    if (userProfile) {
      setUserFormData({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        phone_number: userProfile.phone_number || "",
        address: userProfile.address || "",
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (contractorProfile) {
      setContractorFormData({
        business_name: contractorProfile.business_name || "",
        bio: contractorProfile.bio || "",
        legal_entity_type: contractorProfile.legal_entity_type || "",
        gst_hst_number: contractorProfile.gst_hst_number || "",
        wcb_number: contractorProfile.wcb_number || "",
        service_location: contractorProfile.service_location || "",
        trade_category: contractorProfile.trade_category || [],
        phone_number: contractorProfile.phone_number || "",
        logo: contractorProfile.logo || "",
        portfolio: contractorProfile.portfolio || [],
        licenses: contractorProfile.licenses || [],
        insurance_general_liability: contractorProfile.insurance_general_liability || 0,
        insurance_builders_risk: contractorProfile.insurance_builders_risk || 0,
        insurance_expiry: contractorProfile.insurance_expiry || "",
        insurance_upload: contractorProfile.insurance_upload || "",
        work_guarantee: contractorProfile.work_guarantee || 0,
        contractor_contacts: contractorProfile.contractor_contacts || [],
      });
    }
  }, [contractorProfile]);

  const handleUserInputChange = (field: string, value: string) => {
    setUserFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContractorInputChange = (field: string, value: string | number | string[]) => {
    setContractorFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Specialized handlers for array fields
  const handleTradeCategoryChange = (value: string) => {
    const categories = value.split(',').map(cat => cat.trim()).filter(cat => cat);
    setContractorFormData((prev) => ({
      ...prev,
      trade_category: categories,
    }));
  };

  const removeTradeCategory = (category: string) => {
    setContractorFormData((prev) => ({
      ...prev,
      trade_category: prev.trade_category.filter((c) => c !== category),
    }));
  };

  const handlePortfolioChange = (value: string) => {
    const urls = value.split(',').map(url => url.trim()).filter(url => url);
    setContractorFormData((prev) => ({ ...prev, portfolio: urls }));
  };

  const handleLicensesChange = (value: string) => {
    const urls = value.split(',').map(url => url.trim()).filter(url => url);
    setContractorFormData((prev) => ({ ...prev, licenses: urls }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const supabase = createClient();

      // Update user profile
      const { error: userUpdateError } = await supabase
        .from("users")
        .update(userFormData)
        .eq("id", user.id);

      if (userUpdateError) {
        throw userUpdateError;
      }
      
      // Prepare contractor profile data
      const contractorData = {
        ...contractorFormData,
        user_id: user.id,
        legal_entity_type: contractorFormData.legal_entity_type && contractorFormData.legal_entity_type.trim() !== '' ? contractorFormData.legal_entity_type : null,
        insurance_expiry: contractorFormData.insurance_expiry || null,
        insurance_general_liability: contractorFormData.insurance_general_liability || null,
        insurance_builders_risk: contractorFormData.insurance_builders_risk || null,
        work_guarantee: contractorFormData.work_guarantee || null,
      };
      
      // Update or create contractor profile
      if (contractorProfile) {
        const { error: contractorUpdateError } = await supabase
          .from("contractor_profiles")
          .update(contractorData)
          .eq("user_id", user.id);

        if (contractorUpdateError) {
          throw contractorUpdateError;
        }
      } else {
        const { error: contractorCreateError } = await supabase
          .from("contractor_profiles")
          .insert(contractorData);

        if (contractorCreateError) {
          throw contractorCreateError;
        }
      }

      // Refetch data by calling the fetch function again
      const { data: updatedUserData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      const { data: updatedContractorData } = await supabase
        .from("contractor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setUserProfile(updatedUserData);
      setContractorProfile(updatedContractorData);
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error && typeof error === "object" && "message" in error) {
        toast.error(`Failed to update profile: ${error.message}`);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
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
        <div className="p-6 text-center">
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (userError || contractorError) {
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
        <div className="p-6 text-center">
          <div className="text-red-600 mb-2">Error loading profile</div>
          {userError && (
            <div className="text-sm text-red-500">User profile error: {userError}</div>
          )}
          {contractorError && (
            <div className="text-sm text-red-500">Contractor profile error: {contractorError}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contractor Profile</h1>
        <p className="text-muted-foreground">
          Manage your contractor account and business information
        </p>
      </div>

      {/* Personal Information Section */}
      <PersonalInfoSection
        formData={{
          full_name: `${userFormData.first_name} ${userFormData.last_name}`.trim(),
          phone: userFormData.phone_number,
          location: userFormData.address,
          bio: contractorFormData.bio,
        }}
        user={user}
        onInputChange={(field, value) => {
          if (field === 'full_name') {
            const names = value.split(' ');
            setUserFormData(prev => ({
              ...prev,
              first_name: names[0] || '',
              last_name: names.slice(1).join(' ') || '',
            }));
          } else if (field === 'phone') {
            setUserFormData(prev => ({ ...prev, phone_number: value }));
          } else if (field === 'location') {
            setUserFormData(prev => ({ ...prev, address: value }));
          } else if (field === 'bio') {
            setContractorFormData(prev => ({ ...prev, bio: value }));
          }
        }}
      />

      {/* Business Information Section */}
      <BusinessInfoSection
        formData={{
          business_name: contractorFormData.business_name,
          trade_category: contractorFormData.trade_category,
          portfolio: contractorFormData.portfolio,
          logo: contractorFormData.logo,
          licenses: contractorFormData.licenses,
        }}
        onInputChange={handleContractorInputChange}
        onTradeCategoryChange={handleTradeCategoryChange}
        onPortfolioChange={handlePortfolioChange}
        onLicensesChange={handleLicensesChange}
      />

      {/* Insurance & Compliance Section */}
      <InsuranceSection
        formData={{
          legal_entity_type: contractorFormData.legal_entity_type,
          gst_hst_number: contractorFormData.gst_hst_number,
          wcb_number: contractorFormData.wcb_number,
          work_guarantee: contractorFormData.work_guarantee,
          insurance_general_liability: contractorFormData.insurance_general_liability,
          insurance_builders_risk: contractorFormData.insurance_builders_risk,
          insurance_expiry: contractorFormData.insurance_expiry,
          insurance_upload: contractorFormData.insurance_upload,
          is_insurance_verified: false, // Not editable by user
        }}
        onInputChange={(field, value) => {
          if (field === 'work_guarantee') {
            setContractorFormData(prev => ({ ...prev, work_guarantee: value as number }));
          } else if (field === 'insurance_expiry') {
            setContractorFormData(prev => ({ ...prev, insurance_expiry: value as string }));
          } else if (field === 'insurance_upload') {
            setContractorFormData(prev => ({ ...prev, insurance_upload: value as string }));
          } else if (typeof value === 'boolean') {
            // Handle boolean values separately
            if (field === 'is_insurance_verified') {
              // This field is not editable by user, so we ignore it
              return;
            }
          } else {
            handleContractorInputChange(field, value);
          }
        }}
      />

      {/* Service Location Section */}
      <ServiceLocationSection
        formData={{
          service_location: contractorFormData.service_location,
        }}
        onInputChange={(field, value) => {
          if (field === 'service_location') {
            setContractorFormData(prev => ({ ...prev, service_location: value }));
          }
        }}
      />

      {/* Contact Management Section */}
      <ContactManagementSection
        contractor_contacts={contractorFormData.contractor_contacts}
      />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}