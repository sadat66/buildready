"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  USER_ROLES,
  ProposalStatus,
  PROPOSAL_STATUSES,
  RejectionReason,
  PROJECT_STATUSES,
  ProjectStatus,
  PROJECT_STATUS_VALUES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";
import HomeownerProposalTable from "@/components/features/projects/HomeownerProposalTable";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";

interface Project {
  id: string;
  project_title: string;
  status?: ProjectStatus;
}

// Type for proposals with joined data from Supabase query
interface ProposalWithJoins {
  id: string;
  project: string;
  project_id: string;
  contractor_id: string;
  homeowner: string;
  title: string;
  description_of_work: string;
  subtotal_amount: number;
  tax_included: "yes" | "no";
  total_amount: number;
  deposit_amount: number;
  deposit_due_on: string;
  proposed_start_date: string;
  proposed_end_date: string;
  expiry_date: string;
  status: ProposalStatus;
  is_selected: "yes" | "no";
  is_deleted: "yes" | "no";
  submitted_date?: string;
  accepted_date?: string;
  rejected_date?: string;
  withdrawn_date?: string;
  viewed_date?: string;
  last_updated: string;
  rejected_by?: string;
  rejection_reason?: RejectionReason;
  rejection_reason_notes?: string;
  clause_preview_html?: string;
  attached_files?: Array<{
    id: string;
    filename: string;
    url: string;
    size?: number;
    mimeType?: string;
    uploadedAt?: string;
  }>;
  notes?: string;
  agreement?: string;
  proposals: string[];
  created_by: string;
  last_modified_by: string;
  visibility_settings: "private" | "public" | "shared";
  created_at: string;
  updated_at: string;
  // Joined data
  project_details: {
    id: string;
    project_title: string;
    statement_of_work: string;
    category: string[];
    location: Record<string, unknown>;
    status: ProjectStatus;
    budget: number;
  };
  contractor_profile?: {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
    address?: string;
  };
}

export default function HomeownerProposalsPage() {
  const { user, userRole } = useAuth();

  const [proposals, setProposals] = useState<ProposalWithJoins[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setProposalsLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Fetch projects first
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, project_title")
          .eq("creator", user.id);

        if (projectsError) throw projectsError;
        setProjects(projectsData || []);

        // Fetch proposals - first get project IDs for this homeowner
        const { data: projectIds, error: projectIdsError } = await supabase
          .from("projects")
          .select("id")
          .eq("creator", user.id);

        if (projectIdsError) throw projectIdsError;

        if (projectIds && projectIds.length > 0) {
          const projectIdList = projectIds.map((p) => p.id);
          console.log("Fetching proposals for projects:", projectIdList);

          // Fetch proposals for these projects
          const { data: proposalsData, error: proposalsError } = await supabase
            .from("proposals")
            .select(
              `
            *,
            project_details:projects!proposals_project_fkey (
              id,
              project_title,
              statement_of_work,
              category,
              location,
              status,
              budget
            ),
            contractor_profile:users!proposals_contractor_fkey (
              id,
              full_name,
              email,
              phone_number,
              address
            )
          `
            )
            .in("project", projectIdList)
            .eq("is_deleted", "no")
            .in("status", [
              PROPOSAL_STATUSES.SUBMITTED,
              PROPOSAL_STATUSES.VIEWED,
              PROPOSAL_STATUSES.ACCEPTED,
              PROPOSAL_STATUSES.REJECTED,
            ])
            .order("created_at", { ascending: false });

          if (proposalsError) {
            console.error("Proposals query error:", proposalsError);
            throw proposalsError;
          }

          console.log(
            "Proposals fetched successfully:",
            proposalsData?.length || 0
          );
          console.log("Sample proposal structure:", proposalsData?.[0]);
          setProposals(proposalsData || []);
        } else {
          console.log(
            "No projects found for homeowner, setting empty proposals"
          );
          setProposals([]);
        }
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        if (error && typeof error === "object" && "message" in error) {
          const errorObj = error as {
            message?: string;
            code?: string;
            hint?: string;
          };
          console.error("Error message:", errorObj.message);
          console.error("Error code:", errorObj.code);
          console.error("Error hint:", errorObj.hint);
        }
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      } finally {
        setProposalsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleStatusUpdate = async (
    proposalId: string,
    status: ProposalStatus,
    feedback?: string
  ) => {
    if (!user) return;

    setActionLoading(proposalId);

    try {
      const supabase = createClient();

      // Update proposal status
      const { error: updateError } = await supabase
        .from("proposals")
        .update({
          status,
          ...(feedback && { rejection_reason_notes: feedback }),
          ...(status === PROPOSAL_STATUSES.REJECTED && {
            rejected_date: new Date().toISOString(),
          }),
          ...(status === PROPOSAL_STATUSES.ACCEPTED && {
            accepted_date: new Date().toISOString(),
          }),
        })
        .eq("id", proposalId);

      if (updateError) throw updateError;

                    // If accepted, update project status to proposal selected
      if (status === PROPOSAL_STATUSES.ACCEPTED) {
        const proposal = proposals.find((p) => p.id === proposalId);
        console.log("Found proposal for status update:", proposal);
        console.log("Proposal project_details:", proposal?.project_details);
        if (proposal && proposal.project_details) {
          const { error: projectError } = await supabase
            .from("projects")
            .update({ status: PROJECT_STATUSES.PROPOSAL_SELECTED })
            .eq("id", proposal.project_details.id);

          if (projectError) throw projectError;
        } else {
          console.error(
            "Proposal or project_details not found for proposalId:",
            proposalId
          );
          toast.error(
            "Failed to update project status. Project details not found."
          );
        }
      }

      // Update local state
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                status,
                ...(feedback !== undefined &&
                  feedback !== null && { rejection_reason_notes: feedback }),
              }
            : p
        )
      );

      toast.success(
        `Proposal ${
          status === PROPOSAL_STATUSES.ACCEPTED ? "Accepted!" : "Rejected"
        }. ${
          status === PROPOSAL_STATUSES.ACCEPTED
            ? "The contractor has been notified and the project is now in proposal selected status."
            : "The contractor has been notified of your decision."
        }`
      );
    } catch (error) {
      console.error("Error updating proposal status:", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast.error("Failed to update proposal status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.project_details?.project_title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proposal.contractor_profile?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proposal.description_of_work
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || proposal.status === statusFilter;
    const matchesProject =
      projectFilter === "all" || proposal.project_details?.id === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (proposalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading proposals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!user || userRole !== USER_ROLES.HOMEOWNER) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">
          Access denied. Only homeowners can view project proposals.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Project Proposals
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage proposals from contractors for your projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium">
                Search
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {PROJECT_STATUS_VALUES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project-filter" className="text-sm font-medium">
                Project
              </Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Table */}
      <HomeownerProposalTable
        proposals={filteredProposals}
        onStatusUpdate={handleStatusUpdate}
        actionLoading={actionLoading}
      />

      {/* Empty State */}
      {filteredProposals.length === 0 && !proposalsLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No proposals found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || projectFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't received any proposals yet. Check back later or create a new project to attract contractors."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
