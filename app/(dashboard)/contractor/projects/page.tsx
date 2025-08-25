"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { ProjectService } from "@/lib/services/ProjectService";
import { Project } from "@/types";
import { USER_ROLES } from "@/lib/constants";
import { PaymentModal } from "@/components/shared/modals";
import { Breadcrumbs } from "@/components/shared";
import { LoadingSpinner, SharedPagination, ResultsSummary } from "@/components/shared";
import ProjectList from "@/components/features/projects/ProjectList";
import ContractorProjectTable from "@/components/features/projects/ContractorProjectTable";
import { ContractorProjectCardGrid } from "@/components/features/proposals";
import { Plus, Search, Grid3X3, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContractorProjectsPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [intendedAction, setIntendedAction] = useState<
    "view" | "submit-proposal" | null
  >(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);

  // Check user payment status
  const checkPaymentStatus = async () => {
    if (!user) return;
    
    try {
      setPaymentLoading(true);
      const response = await fetch('/api/payments/check-status?userType=contractor', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasPaid(data.hasPaid || false);
      } else {
        console.error('Failed to check payment status');
        setHasPaid(false);
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      setHasPaid(false);
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
  }, [user]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setProjectsLoading(false);
        return;
      }

      try {
        const projectService = new ProjectService();
        const result = await projectService.getAvailableProjects();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch projects");
        }

        setProjects(result.data || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects");
      } finally {
        setProjectsLoading(false);
      }
    };

    if (!loading && user && userRole === USER_ROLES.CONTRACTOR) {
      fetchProjects();
    }
  }, [user, userRole, loading]);

  // Handle payment success
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast.success("Payment successful! You can now access project details.");
    
    // Refetch payment status to update UI
    checkPaymentStatus();

    if (selectedProject && intendedAction) {
      if (intendedAction === "view") {
        router.push(`/contractor/projects/view/${selectedProject.id}`);
      } else if (intendedAction === "submit-proposal") {
        router.push(
          `/contractor/projects/submit-proposal/${selectedProject.id}`
        );
      }
    }

    // Reset the intended action
    setIntendedAction(null);
  };

  // Handle submit proposal click
  const handleSubmitProposal = (project: Project) => {
    if (!hasPaid) {
      setSelectedProject(project);
      setIntendedAction("submit-proposal");
      setShowPaymentModal(true);
    } else {
      router.push(`/contractor/projects/submit-proposal/${project.id}`);
    }
  };

  // Handle view details click
  const handleViewDetails = (project: Project) => {
    if (!hasPaid) {
      setSelectedProject(project);
      setIntendedAction("view");
      setShowPaymentModal(true);
    } else {
      router.push(`/contractor/projects/view/${project.id}`);
    }
  };

  // Handle row click - check payment status first
  const handleRowClick = (project: Project) => {
    if (!hasPaid) {
      setSelectedProject(project);
      setIntendedAction("view");
      setShowPaymentModal(true);
    } else {
      router.push(`/contractor/projects/view/${project.id}`);
    }
  };

  if (loading || projectsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Available Projects
            </h1>
            <p className="text-muted-foreground">
              Browse and bid on published construction projects
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || userRole !== USER_ROLES.CONTRACTOR) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600">
              Only contractors can view available projects.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.project_title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      project.statement_of_work
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      project.location?.address
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      project.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/contractor/dashboard" },
            { label: "Available Projects", href: "/contractor/projects" },
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Available Projects
          </h1>
          <p className="text-muted-foreground">
            Browse and bid on published construction projects
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Open for Proposals">
                Open for Proposals
              </SelectItem>
              <SelectItem value="Awarded">Awarded</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 px-3"
          >
            <Table2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("card")}
            className="h-8 px-3"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>



      {/* Results Summary */}
      <ResultsSummary
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={filteredProjects.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Content */}
      {viewMode === "table" ? (
        <ContractorProjectTable
          projects={paginatedProjects}
          onProjectClick={handleRowClick}
        />
      ) : (
        <ContractorProjectCardGrid
          projects={paginatedProjects}
          onViewDetails={handleViewDetails}
          onSubmitProposal={handleSubmitProposal}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* Shared Pagination */}
      <SharedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        userType="contractor"
        projectTitle={selectedProject?.project_title}
      />
    </div>
  );
}
