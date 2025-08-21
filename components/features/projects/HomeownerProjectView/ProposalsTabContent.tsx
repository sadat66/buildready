"use client";

import { useState } from "react";
import { Project } from "@/types/database/projects";
import { Proposal } from "@/types/database/proposals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ThumbsDown,
  FileText,
  TrendingUp,
  MessageSquare,
  Eye,
  Download,
  Edit,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_ROLES, PROJECT_STATUSES } from "@/lib/constants";

interface ProposalsTabContentProps {
  proposals: Proposal[];
  project: Project;
  userRole: (typeof USER_ROLES)[keyof typeof USER_ROLES];
  onAcceptProposal: (proposalId: string) => Promise<void>;
  onRejectProposal: (
    proposalId: string,
    reason?: string,
    notes?: string
  ) => Promise<void>;
  onViewProposal: (proposalId: string) => void;
  onSubmitProposal?: (proposalData: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
  updatingProposal?: string | null;
}

export function ProposalsTabContent({
  proposals,  
  project,
  userRole, 
  onAcceptProposal,
  onRejectProposal,
  onViewProposal,
  onSubmitProposal,
  loading = false,
  updatingProposal = null,
}: ProposalsTabContentProps) {
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "rating">("date");

  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "viewed":
        return "bg-blue-500";
      case "submitted":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredProposals = proposals.filter((proposal) => {
    if (filterStatus === "all") return true;
    return proposal.status === filterStatus;
  });

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "price":
        return a.total_amount - b.total_amount;
      case "rating":
        // You could implement rating-based sorting here
        return 0;
      default:
        return 0;
    }
  });

  const toggleProposalSelection = (proposalId: string) => {
    setSelectedProposals((prev) =>
      prev.includes(proposalId)
        ? prev.filter((id) => id !== proposalId)
        : [...prev, proposalId]
    );
  };

  const canCompare = selectedProposals.length >= 2;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading proposals...</p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Proposals Yet
          </h3>
          <p className="text-muted-foreground mb-4">
            {userRole === "homeowner"
              ? "No contractors have submitted proposals for this project yet."
              : "You haven't submitted any proposals for this project yet."}
          </p>

          {userRole === USER_ROLES.CONTRACTOR &&
            project.status === PROJECT_STATUSES.OPEN_FOR_PROPOSALS && (
              <Button
                onClick={() => onSubmitProposal && onSubmitProposal({})}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                Submit Your First Proposal
              </Button>
            )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                Proposals ({proposals.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {userRole === "homeowner"
                  ? "Review and manage contractor proposals"
                  : "Track your submitted proposals"}
              </p>
            </div>

            {/* Filters and Sorting */}
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "price" | "rating")
                }
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </CardHeader>

        {/* Comparison Actions */}
        {userRole === "homeowner" && proposals.length > 1 && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Compare Proposals: Select 2 or more to compare
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProposals([])}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Clear Selection
                </Button>

                {canCompare && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      /* Implement comparison view */
                    }}
                  >
                    Compare Selected ({selectedProposals.length})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {sortedProposals.map((proposal) => (
          <Card
            key={proposal.id}
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              proposal.status === "accepted" &&
                "border-l-4 border-l-green-500 bg-green-50/50",
              proposal.status === "rejected" &&
                "border-l-4 border-l-red-500 bg-red-50/50",
              proposal.status === "viewed" &&
                "border-l-4 border-l-blue-500 bg-blue-50/50"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {proposal.title}
                    </h3>
                    <Badge
                      className={cn(
                        getStatusColor(proposal.status),
                        "text-white px-2 py-1 text-xs"
                      )}
                    >
                      {getStatusText(proposal.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>Contractor ID: {proposal.contractor}</span>
                    </div>
                    <span>•</span>
                    <span>Submitted {formatDate(proposal.createdAt)}</span>
                  </div>
                </div>

                {/* Selection Checkbox for Homeowners */}
                {userRole === "homeowner" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedProposals.includes(proposal.id)}
                      onChange={() => toggleProposalSelection(proposal.id)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-muted-foreground">
                      Compare
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description of Work
                </Label>
                <p className="mt-1 text-gray-900 leading-relaxed">
                  {proposal.description_of_work}
                </p>
              </div>

              {/* Financial and Timeline Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Total Amount
                    </Label>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(proposal.total_amount)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Timeline
                    </Label>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(proposal.proposed_start_date)} -{" "}
                      {formatDate(proposal.proposed_end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Deposit
                    </Label>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(proposal.deposit_amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {proposal.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Additional Notes
                  </Label>
                  <p className="mt-1 text-gray-900">{proposal.notes}</p>
                </div>
              )}

              {/* Attached Files */}
              {proposal.attached_files &&
                proposal.attached_files.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Attached Files
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {proposal.attached_files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{file.filename}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = file.url;
                              link.download = file.filename;
                              link.click();
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => onViewProposal(proposal.id)}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>

                {userRole === USER_ROLES.HOMEOWNER &&
                  (proposal.status === "submitted" ||
                    proposal.status === "viewed") && (
                    <>
                      <Button
                        onClick={() => onAcceptProposal(proposal.id)}
                        disabled={updatingProposal === proposal.id}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {updatingProposal === proposal.id
                          ? "Accepting..."
                          : "Accept Proposal"}
                      </Button>

                      <Button
                        onClick={() =>
                          onRejectProposal(
                            proposal.id,
                            "other",
                            "Proposal declined by homeowner"
                          )
                        }
                        disabled={updatingProposal === proposal.id}
                        variant="destructive"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        {updatingProposal === proposal.id
                          ? "Rejecting..."
                          : "Reject Proposal"}
                      </Button>
                    </>
                  )}

                {userRole === USER_ROLES.HOMEOWNER && (
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Contractor
                  </Button>
                )}

                {userRole === USER_ROLES.CONTRACTOR && (
                  <Button
                    variant="outline"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Proposal
                  </Button>
                )}
              </div>

              {/* Status-specific Messages */}
              {proposal.status === "accepted" && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      This proposal has been accepted
                    </span>
                  </div>
                  {proposal.accepted_date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Accepted on {formatDate(proposal.accepted_date)}
                    </p>
                  )}
                </div>
              )}

              {proposal.status === "rejected" && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">
                      This proposal has been rejected
                    </span>
                  </div>
                  {proposal.rejected_date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Rejected on {formatDate(proposal.rejected_date)}
                    </p>
                  )}
                  {proposal.rejection_reason_notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Reason: {proposal.rejection_reason_notes}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
