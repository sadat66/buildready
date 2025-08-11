"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Users,
  BarChart3,
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
    ];

    switch (userRole) {
      case "homeowner":
        return [
          { name: "Dashboard", href: "/homeowner/dashboard", icon: Home },
          { name: "My Projects", href: "/homeowner/projects", icon: FileText },
        ];

      case "contractor":
        return [
          { name: "Dashboard", href: "/contractor/dashboard", icon: Home },
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
        ];

      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: Home },
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

      {/* Sidebar - Fixed height, starts below navbar */}
      <div
        className={`
        fixed top-16 left-0 h-16 bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-16" : "w-64"}
        lg:translate-x-0 lg:z-auto lg:h-screen lg:top-0
        group
        ${isCollapsed ? "lg:w-16" : "lg:w-64"}
        lg:hover:w-64
        overflow-hidden
        `}
        onMouseEnter={() => {
          if (window.innerWidth >= 1024 && isCollapsed) {
            onToggleCollapse();
          }
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 1024 && !isCollapsed) {
            onToggleCollapse();
          }
        }}
      >
        <div className="flex flex-col h-full bg-white overflow-hidden">
          {/* Header - Show logo based on collapsed state */}
          <div className="flex items-center justify-between py-4 px-4 flex-shrink-0 overflow-hidden">
            <Link
              href={`/${user?.role}/dashboard`}
              className="cursor-pointer flex-shrink-0"
            >
              <Image
                src="/images/brand/app-icon.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </Link>

            {/* Collapse toggle button - only show on desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation - Takes remaining height */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden min-h-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`
                      w-full transition-colors overflow-hidden
                      ${
                        isActive(item.href)
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                      ${
                        isCollapsed
                          ? "justify-center px-2"
                          : "justify-start px-3"
                      }
                      group-hover:justify-start group-hover:px-3
                    `}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <Icon
                      className={`h-5 w-5 transition-all duration-300 flex-shrink-0 ${isCollapsed ? "mr-0" : "mr-3"} group-hover:mr-3`}
                    />
                    <span
                      className={`transition-all duration-300 overflow-hidden ${
                        isCollapsed ? "hidden" : "block"
                      } group-hover:block`}
                    >
                      {item.name}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
