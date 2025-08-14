"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import Breadcrumbs from "@/components/shared/Breadcrumbs";

import { ExtendedUser } from "@/contexts/AuthContext";

interface ContractorProfileProps {
  user: ExtendedUser;
}

export function ContractorProfile({ user }: ContractorProfileProps) {
  const [, setUserData] = useState<{
    full_name: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    user_role: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
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
          first_name: data?.first_name || "",
          last_name: data?.last_name || "",
          phone_number: data?.phone_number || "",
          address: data?.address || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("users")
        .update(formData)
        .eq("id", user.id)
        .select();

      if (error) {
        console.error("Supabase error details:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        throw error;
      }

      // Update local state
      setUserData((prev) => (prev ? { ...prev, ...formData } : null));
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Full error object:", JSON.stringify(error, null, 2));

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
        <div className="rounded-lg border bg-card text-card-foreground">
          <div className="p-6">
            <div className="text-center">Loading profile...</div>
          </div>
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
          Manage your contractor account information
        </p>
      </div>

      {/* Profile Information */}
      <div className="rounded-lg border bg-card text-card-foreground">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <p className="text-sm text-muted-foreground">
              Your account details and contact information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                placeholder="Enter your first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  handleInputChange("last_name", e.target.value)
                }
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Email address cannot be changed for security reasons
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Location
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter your city or location"
            />
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="rounded-lg border bg-card text-card-foreground">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Summary</h3>
            <p className="text-sm text-muted-foreground">
              Your contractor account details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Account Type</Label>
              <p className="text-sm font-semibold capitalize">Contractor</p>
            </div>
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Member Since</Label>
              <p className="text-sm font-semibold">
                {user?.created_at
                  ? new Date(user?.created_at as string).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

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