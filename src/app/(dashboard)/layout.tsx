"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && userRole && !loading) {
      const currentPath = pathname;
      const roleDashboard = `/${userRole}/dashboard`;

      if (currentPath === "/dashboard") {
        router.push(roleDashboard);
      }
    }
  }, [user, userRole, loading, router, pathname]);

  useEffect(() => {
    if (user && userRole && !loading && pathname) {
      const pathSegments = pathname.split("/");
      const routeRole = pathSegments[1];

      if (routeRole && routeRole !== "dashboard" && userRole !== routeRole) {
        console.log(
          `Access denied: User role ${userRole} cannot access ${routeRole} dashboard`
        );
        setAccessDenied(true);
        setTimeout(() => {
          router.push(`/${userRole}/dashboard`);
        }, 2000);
      } else {
        setAccessDenied(false);
      }
    }
  }, [user, userRole, loading, pathname, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached, forcing refresh");
        window.location.reload();
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner
          text="Loading..."
          subtitle="Please wait a few seconds..."
          size="lg"
          variant="default"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (accessDenied) {
    const pathSegments = pathname?.split("/") || [];
    const routeRole = pathSegments[1];

    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center max-w-md mx-auto">
          <LoadingSpinner
            text="Access Denied"
            subtitle={`You don't have permission to access the ${routeRole} dashboard. Redirecting you to your ${userRole} dashboard...`}
            size="lg"
            variant="error"
            className="mb-4"
          />
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar - Full width, fixed */}
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area - No flex, content flows naturally */}
      <div className="pt-[73px]">
        {/* Sidebar - Fixed height, starts below navbar, positioned absolutely */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={!sidebarOpen}
          onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content - Properly centered with sidebar space */}
        <main className="transition-all duration-300 min-h-screen lg:pl-16">
          <div className="max-w-[1440px] mx-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
