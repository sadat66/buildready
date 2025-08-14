"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save, ArrowLeft, Mail, Phone, MapPin, FileText, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import toast from "react-hot-toast";

import { ExtendedUser } from '@/contexts/AuthContext'

interface HomeownerProfileProps {
  user: ExtendedUser;
}

export function HomeownerProfile({ user }: HomeownerProfileProps) {
  const [, setUserData] = useState<{
    full_name: string;
    phone: string;
    location: string;
    bio: string;
    role: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    bio: "",
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
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      setUserData((prev) => (prev ? { ...prev, ...formData } : null));
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/homeowner/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Homeowner Profile</h1>
                <p className="text-slate-600 mt-1">Manage your homeowner account information</p>
              </div>
            </div>
            <Link href="/homeowner/dashboard">
              <Button variant="outline" size="sm" className="hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
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
                  className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
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
                  className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
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
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter your city or location"
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold text-slate-700 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-slate-500" />
                About Me
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about your home improvement needs..."
                rows={4}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-slate-500">This will be visible to contractors</p>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow mt-6">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-lg p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Account Summary</h3>
                <p className="text-sm text-slate-600">Your homeowner account details</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Label className="text-sm font-medium text-slate-700">Account Type</Label>
                <p className="text-sm text-slate-900 font-semibold capitalize">Homeowner</p>
              </div>
              <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Label className="text-sm font-medium text-slate-700">Member Since</Label>
                <p className="text-sm text-slate-900 font-semibold">
                  {user?.created_at ? new Date(user?.created_at as string).toLocaleDateString() : "N/A"}
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
  );
}