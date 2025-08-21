"use client";

import { useState, useEffect } from "react";
import { Project } from "@/types/database/projects";
import { Proposal } from "@/types/database/proposals";
import { User } from "@/types/database/auth";
import { ProjectViewTabs } from "./ProjectViewTabs";
import { MessagesTabContent } from "./MessagesTabContent";
import ProjectViewHeader from "./ProjectViewHeader";
import ProjectImageGallery from "./ProjectImageGallery";

import { Button } from "@/components/ui/button";
import { Share, Globe } from "lucide-react";
import { USER_ROLES, PROJECT_STATUSES } from "@/lib/constants";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import {
  DetailsTabContent,
  ProposalsTabContent,
} from "@/components/features/projects";

export type TabType = "details" | "proposals" | "messages";

interface ProjectViewProps {
  project: Project;
  proposals: Proposal[];
  user: User;
  userRole: (typeof USER_ROLES)[keyof typeof USER_ROLES];
  onEditProject: () => void;
  onDeleteProject: () => void;
  onAcceptProposal: (proposalId: string) => Promise<void>;
  onRejectProposal: (
    proposalId: string,
    reason?: string,
    notes?: string
  ) => Promise<void>;
  onViewProposal: (proposalId: string) => void;
  onSubmitProposal?: (proposalData: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
  proposalsLoading?: boolean;
  updatingProposal?: string | null;
}

export default function HomeownerProjectView({
  project,
  proposals,
  user,
  userRole,
  onEditProject,
  onDeleteProject,
  onAcceptProposal,
  onRejectProposal,
  onViewProposal,
  onSubmitProposal,
  loading = false,
  proposalsLoading = false,
  updatingProposal = null,
}: ProjectViewProps) {
  // Smart tab selection based on context
  const [activeTab, setActiveTab] = useState<TabType>("details");

  // Auto-select most relevant tab based on context
  useEffect(() => {
    if (userRole === USER_ROLES.HOMEOWNER) {
      if (
        proposals.length > 0 &&
        proposals.some((p) => p.status === "submitted")
      ) {
        setActiveTab("proposals");
      }
    } else if (userRole === USER_ROLES.CONTRACTOR) {
      if (proposals.length === 0) {
        setActiveTab("details");
      } else {
        setActiveTab("proposals");
      }
    }
  }, [userRole, proposals, project.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    const commonProps = {
      project,
      userRole,
      user,
    };

    switch (activeTab) {
      case "details":
        return <DetailsTabContent {...commonProps} />;
      case "proposals":
        return (
          <ProposalsTabContent
            {...commonProps}
            proposals={proposals}
            onAcceptProposal={onAcceptProposal}
            onRejectProposal={onRejectProposal}
            onViewProposal={onViewProposal}
            onSubmitProposal={onSubmitProposal}
            loading={proposalsLoading}
            updatingProposal={updatingProposal}
          />
        );
      case "messages":
        return <MessagesTabContent />;
      default:
        return <DetailsTabContent {...commonProps} />;
    }
  };

  const getAvailableTabs = (): TabType[] => {
    const baseTabs: TabType[] = ["details"];

    if (userRole === USER_ROLES.HOMEOWNER) {
      return [...baseTabs, "proposals", "messages"];
    } else if (userRole === USER_ROLES.CONTRACTOR) {
      return [...baseTabs, "proposals", "messages"];
    }
    return baseTabs;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumbs />
        </div>

        {/* Project Header - Image-like UI */}
        <div className="mb-4 sm:mb-6">
          <ProjectViewHeader project={project} user={user} />
        </div>

        {/* Navigation Tabs */}
        <div className=" mb-4 sm:mb-6 overflow-x-auto">
          <ProjectViewTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRole={userRole}
            availableTabs={getAvailableTabs()}
            proposalCount={proposals.length}
            project={project}
          />
        </div>

        {/* Tab Content */}
        <div className="  overflow-hidden">{renderTabContent()}</div>
      </div>
    </div>
  );
}
