"use client";

import { use } from "react";
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
  const resolvedParams = use(params) as { role: string };
  const { role } = resolvedParams;

  switch (role) {
    case "contractor":
      return <ContractorDashboard />;

    case "homeowner":
      return <HomeownerDashboard />;

    case "admin":
      return <RoleSelector />;

    default:
      return <RoleSelector />;
  }
}
