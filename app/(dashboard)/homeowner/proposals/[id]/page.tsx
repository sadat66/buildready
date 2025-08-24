"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Breadcrumbs, LoadingSpinner } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Building,
  User,
  DollarSign,
  Calendar,
  FileText,
  MapPin,
  AlertCircle,
  Star,
  Shield,
  Building2,
  ThumbsUp,
  ThumbsDown,
  Clock4,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { USER_ROLES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { getProposalStatusConfig } from "@/lib/helpers";

interface Location {
  lat: number;
  lng: number;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

interface HomeownerProposalData {
  id: string;
  title: string;
  description_of_work: string;
  subtotal_amount: number | null;
  tax_included: "yes" | "no";
  total_amount: number | null;
  deposit_amount: number | null;
  deposit_due_on: string | null;
  proposed_start_date: string | null;
  proposed_end_date: string | null;
  expiry_date: string | null;
  status: string;
  is_selected: "yes" | "no";
  submitted_date: string | null;
  accepted_date: string | null;
  rejected_date: string | null;
  withdrawn_date: string | null;
  viewed_date: string | null;
  last_updated: string;
  rejected_by: string | null;
  rejection_reason: string | null;
  rejection_reason_notes: string | null;
  clause_preview_html: string | null;
  attached_files: Array<{
    id: string;
    filename: string;
    url: string;
    size?: number;
    mimeType?: string;
    uploadedAt?: string;
  }>;
  notes: string | null;
  visibility_settings: string;
  project: string;
  contractor: string;
  homeowner: string;
  project_details?: {
    id: string;
    project_title: string;
    statement_of_work: string;
    category: string[] | string;
    location?: Location;
    status: string;
    budget: number | null;
    start_date: string | null;
    end_date: string | null;
    permit_required: boolean;
    creator: string;
  };
  contractor_details?: {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
    business_name?: string;
    license_number?: string;
    insurance_info?: string;
    address?: Address;
    rating?: number;
    completed_projects?: number;
    years_experience?: number;
  };
}

export default function HomeownerProposalViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [proposal, setProposal] = useState<HomeownerProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decisionMade, setDecisionMade] = useState(false);

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const proposalId = resolvedParams.id;

  useEffect(() => {
    if (!user) return;

    const fetchProposal = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from("proposals")
          .select(
            `
            *,
            project:projects (
              id,
              project_title,
              statement_of_work,
              category,
              location,
              status,
              budget,
              start_date,
              end_date,
              permit_required,
              creator
            )
          `
          )
          .eq("id", proposalId)
          .eq("homeowner", user.id)
          .eq("is_deleted", "no")
          .single();

        if (fetchError) {
          console.error("Error fetching proposal:", fetchError);
          setError(fetchError.message);
          return;
        }

        // Manually fetch contractor details
        let contractor_details = null;
        if (data.contractor) {
          const { data: contractorData, error: contractorError } =
            await supabase
              .from("users")
              .select(
                "id, full_name, email, phone_number, address, business_name, license_number, insurance_info"
              )
              .eq("id", data.contractor)
              .single();

          if (!contractorError && contractorData) {
            contractor_details = contractorData;
          }
        }

        // Transform the data to match our HomeownerProposalData interface
        const transformedData: HomeownerProposalData = {
          ...data,
          project_details: data.project,
          contractor_details,
        };

        setProposal(transformedData);
      } catch (err) {
        setError("Failed to fetch proposal details");
        console.error("Error fetching proposal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [user, proposalId]);

  const handleAcceptProposal = async () => {
    if (!proposal) return;

    try {
      // Update proposal status to accepted
      // Update project status to proposal selected
      console.log("Proposal accepted:", proposal.id);
      setDecisionMade(true);
      // Redirect to project details or show success message
      setTimeout(
        () => router.push(`/homeowner/projects/view/${proposal.project}`),
        2000
      );
    } catch (error) {
      console.error("Error accepting proposal:", error);
    }
  };

  const handleRejectProposal = async () => {
    if (!proposal) return;

    try {
      // Update proposal status to rejected
      console.log("Proposal rejected:", proposal.id);
      setDecisionMade(true);
      // Show rejection reason modal or redirect
      setTimeout(() => router.push("/homeowner/proposals"), 2000);
    } catch (error) {
      console.error("Error rejecting proposal:", error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Proposal
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Proposal Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested proposal could not be found.
          </p>
          <Button onClick={() => router.push("/homeowner/proposals")}>
            View All Proposals
          </Button>
        </div>
      </div>
    );
  }

  if (userRole !== USER_ROLES.HOMEOWNER) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don&apos;t have permission to view this proposal.
          </p>
        </div>
      </div>
    );
  }

  const proposalStatusConfig = getProposalStatusConfig(proposal.status);
  const StatusIcon = proposalStatusConfig.icon;

  if (decisionMade) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Decision Recorded
          </h2>
          <p className="text-gray-600 mb-4">
            Your decision has been recorded. You&apos;ll be redirected shortly.
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/homeowner/dashboard" },
              { label: "Proposals", href: "/homeowner/proposals" },
              { label: `Proposal #${proposal.id.slice(-8)}`, href: "#" },
            ]}
          />
        </div>

        {/* Decision Header */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${proposalStatusConfig.bgColor}`}>
                  <StatusIcon className={`h-5 w-5 ${proposalStatusConfig.color}`} />
                </div>
                <Badge
                  className={`${proposalStatusConfig.bgColor} ${proposalStatusConfig.color} border-0`}
                >
                  {proposalStatusConfig.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  Submitted{" "}
                  {proposal.submitted_date
                    ? formatDate(proposal.submitted_date)
                    : "Date not specified"}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {proposal.project_details?.project_title || "Project Details"}
              </h1>
              <p className="text-gray-600 text-lg">
                Proposal from{" "}
                {proposal.contractor_details?.business_name || "Contractor"}
              </p>
            </div>

            {/* Quick Decision Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAcceptProposal}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <ThumbsUp className="h-5 w-5 mr-2" />
                Accept
              </Button>
              <Button
                onClick={handleRejectProposal}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 px-8 py-3 text-lg font-semibold"
              >
                <ThumbsDown className="h-5 w-5 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Project & Proposal Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Financial Summary
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Proposal Amount</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(proposal.total_amount || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Project Budget</p>
                  <p className="text-2xl font-semibold text-gray-700">
                    {proposal.project_details?.budget
                      ? formatCurrency(proposal.project_details.budget)
                      : "Not specified"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {proposal.project_details?.budget && proposal.total_amount
                      ? formatCurrency(
                          proposal.project_details.budget -
                            proposal.total_amount
                        )
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Work Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Work Description
                </h2>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                {proposal.description_of_work}
              </p>

              {proposal.notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Additional Notes
                  </h4>
                  <p className="text-blue-800">{proposal.notes}</p>
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Project Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {proposal.project_details?.location
                        ? `Lat: ${proposal.project_details.location.lat}, Lng: ${proposal.project_details.location.lng}`
                        : "Location not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {proposal.project_details?.category
                        ? Array.isArray(proposal.project_details.category)
                          ? proposal.project_details.category.join(", ")
                          : proposal.project_details.category
                        : "Not specified"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {proposal.project_details?.start_date &&
                      proposal.project_details?.end_date
                        ? `${formatDate(
                            proposal.project_details.start_date
                          )} - ${formatDate(proposal.project_details.end_date)}`
                        : "Dates not specified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {proposal.project_details?.permit_required
                        ? "Permit Required"
                        : "No Permit Required"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contractor & Actions */}
          <div className="space-y-6">
            {/* Contractor Profile */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Contractor Profile
                </h2>
              </div>

              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {proposal.contractor_details?.full_name || "Contractor"}
                </h3>
                <p className="text-gray-600">
                  {proposal.contractor_details?.business_name ||
                    "Business Name Not Available"}
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">
                      {proposal.contractor_details?.rating || "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    {proposal.contractor_details?.completed_projects || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Projects</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    {proposal.contractor_details?.years_experience
                      ? `${proposal.contractor_details.years_experience}y`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Experience</p>
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">
                    Licensed:{" "}
                    {proposal.contractor_details?.license_number ||
                      "Not specified"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">
                    {proposal.contractor_details?.insurance_info ||
                      "Insurance information not available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Clock4 className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Timeline
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium text-gray-900">
                    {proposal.project_details?.start_date
                      ? formatDate(proposal.project_details.start_date)
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-medium text-gray-900">
                    {proposal.project_details?.end_date
                      ? formatDate(proposal.project_details.end_date)
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">
                    {proposal.project_details?.start_date &&
                    proposal.project_details?.end_date
                      ? `${Math.ceil(
                          (new Date(
                            proposal.project_details.end_date
                          ).getTime() -
                            new Date(
                              proposal.project_details.start_date
                            ).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )} days`
                      : "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact & Actions - Hidden for now */}
            {/* 
             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
               <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Actions</h2>
               
               <div className="space-y-3">
                 <Button variant="outline" className="w-full">
                   <Phone className="h-4 w-4 mr-2" />
                   Call Contractor
                 </Button>
                 <Button variant="outline" className="w-full">
                   <Mail className="h-4 w-4 mr-2" />
                   Send Message
                 </Button>
                 <Button variant="outline" className="w-full">
                   <Download className="h-4 w-4 mr-2" />
                   Download PDF
                 </Button>
                 <Button variant="outline" className="w-full">
                   <Share2 className="h-4 w-4 mr-2" />
                   Share
                 </Button>
               </div>
             </div>
             */}
          </div>
        </div>
      </div>
    </div>
  );
}
