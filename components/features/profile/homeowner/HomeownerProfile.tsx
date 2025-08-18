"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, Shield, User, Phone, MapPin, Calendar, Crown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RandomAvatar from "@/components/ui/random-avatar";

import { ExtendedUser } from "@/contexts/AuthContext";

interface HomeownerProfileProps {
  user: ExtendedUser;
}

export function HomeownerProfile({ user }: HomeownerProfileProps) {
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

      console.log("Attempting to update profile with data:", formData);
      console.log("User ID:", user.id);

      const { data, error } = await supabase
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

      console.log("Update successful, returned data:", data);

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
          <Link href="/homeowner/dashboard">
            <Button variant="outline" size="sm" className="bg-white/70 backdrop-blur-sm border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg">
          <div className="relative p-8 flex items-center justify-center">
            <div className="text-center text-gray-700 font-semibold">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Enhanced Header with Clean Background */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg">
        
        <div className="relative p-6 sm:p-8 space-y-6">
          {/* Profile Header Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <RandomAvatar 
                name={user?.full_name || user?.email || "User"}
                size={80}
                className="transform hover:scale-105 transition-all duration-300"
              />

            </div>
            <div className="space-y-3 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                Profile Settings
              </h1>
              <p className="text-gray-600 font-medium">
                Manage your homeowner account information
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Badge className="bg-gray-900 text-white border-0 px-3 py-1.5 text-sm font-semibold">
                  <Crown className="mr-2 h-3 w-3" />
                  Homeowner
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Card */}
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                <p className="text-sm text-gray-600">Your account details and contact information</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                First Name
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="Enter your first name"
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                Last Name
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Enter your last name"
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                placeholder="Enter your phone number"
                className="pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-50 border-gray-200 text-gray-600"
            />
            <p className="text-xs text-gray-500 flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Email address cannot be changed for security reasons
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Location
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your city or location"
                className="pl-10 border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Summary Card */}
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Account Summary</h3>
                <p className="text-sm text-gray-600">Your homeowner account details</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Account Type</Label>
                  <p className="text-sm font-semibold text-gray-800 capitalize">Homeowner</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Member Since</Label>
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.created_at
                      ? new Date(user?.created_at as string).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
