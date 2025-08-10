"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  Home,
  FileText,
  MessageSquare,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Users,
  BarChart3,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "./button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { userRole, user } = useAuth();
  const pathname = usePathname();

  const getMenuItems = () => {
    const baseItems = [
      { name: "Dashboard", href: `/${userRole}/dashboard`, icon: Home },
      { name: "Profile", href: `/${userRole}/profile`, icon: User },
      { name: "Settings", href: `/${userRole}/settings`, icon: Settings },
    ];

    switch (userRole) {
      case "homeowner":
        return [
          ...baseItems,
          { name: "My Projects", href: "/homeowner/projects", icon: FileText },
          { name: "Proposals", href: "/homeowner/proposals", icon: Briefcase },
          {
            name: "Messages",
            href: "/homeowner/messages",
            icon: MessageSquare,
          },
          { name: "Calendar", href: "/homeowner/calendar", icon: Calendar },
          { name: "Payments", href: "/homeowner/payments", icon: DollarSign },
        ];

      case "contractor":
        return [
          ...baseItems,
          {
            name: "Active Projects",
            href: "/contractor/projects",
            icon: FileText,
          },
          {
            name: "My Proposals",
            href: "/contractor/proposals",
            icon: Briefcase,
          },
          {
            name: "Messages",
            href: "/contractor/messages",
            icon: MessageSquare,
          },
          { name: "Calendar", href: "/contractor/calendar", icon: Calendar },
          { name: "Earnings", href: "/contractor/earnings", icon: DollarSign },
        ];

      case "admin":
        return [
          ...baseItems,
          { name: "User Management", href: "/admin/users", icon: Users },
          {
            name: "System Analytics",
            href: "/admin/analytics",
            icon: BarChart3,
          },
          { name: "Project Overview", href: "/admin/projects", icon: FileText },
          {
            name: "Financial Reports",
            href: "/admin/financials",
            icon: DollarSign,
          },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-screen min-h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-16" : "w-56"}
        lg:translate-x-0 lg:static lg:z-auto lg:h-screen lg:min-h-screen
      `}
      >
        <div className="flex flex-col h-full min-h-screen">
          {/* Header - Show logo based on collapsed state */}
          <div className="flex items-center justify-between py-3 px-4 border-b  border-gray-200 flex-shrink-0">
            <Link href={`/${user?.role}/dashboard`} className="cursor-pointer">
              <Image
                src="/images/brand/logo.png"
                alt="Logo"
                width={120}
                height={120}
                className="w-[120px] h-[40px]"
              />
            </Link>

            {/* Collapse toggle button - only show on desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation - Takes remaining height */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`
                      w-full justify-start transition-colors
                      ${
                        isActive(item.href)
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                      ${isCollapsed ? "justify-center px-2" : "px-3"}
                    `}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <Icon
                      className={`h-4 w-4 ${isCollapsed ? "mr-0" : "mr-3"}`}
                    />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Footer - Only show when expanded, fixed at bottom */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="text-xs text-gray-500 text-center">
                <p>© 2024 BuildReady</p>
                <p className="mt-1 capitalize">
                  {userRole || "User"} Dashboard
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
