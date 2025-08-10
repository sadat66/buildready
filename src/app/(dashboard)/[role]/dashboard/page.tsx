"use client";

import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeownerDashboard,
  ContractorDashboard,
  RoleSelector,
} from "@/components/features/dashboard";

interface DashboardPageProps {
  params: Promise<{
    role: string;
  }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { user } = useAuth();
  const resolvedParams = use(params) as { role: string };
  const { role } = resolvedParams;

  switch (role) {
    case "contractor":
      return <ContractorDashboard userEmail={user?.email} />;

    case "homeowner":
      return <HomeownerDashboard userEmail={user?.email} />;

    case "admin":
      return <RoleSelector />;

    default:
      return <RoleSelector />;
  }
}
