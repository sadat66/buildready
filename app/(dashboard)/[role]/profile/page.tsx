"use client";

import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeownerProfile,
  ContractorProfile,
} from "@/components/features/profile";

interface ProfilePageProps {
  params: Promise<{
    role: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user } = useAuth();
  const resolvedParams = use(params) as { role: string };
  const { role } = resolvedParams;

  switch (role) {
    case "contractor":
      return <ContractorProfile user={user} />;

    case "homeowner":
      return <HomeownerProfile user={user} />;

    default:
      return <HomeownerProfile user={user} />;
  }
}
