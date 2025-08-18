"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  FileText,
  Briefcase,
  Users,
  BarChart3,
  DollarSign,
  X,
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
  const { userRole } = useAuth();
  const pathname = usePathname();

  const getMenuItems = () => {
    const baseItems = [
      { name: "Dashboard", href: `/${userRole}/dashboard`, icon: Home },
    ];

    switch (userRole) {
      case "homeowner":
        return [
          { name: "Dashboard", href: "/homeowner/dashboard", icon: Home },
          { name: "Projects", href: "/homeowner/projects", icon: FileText },
          { name: "Proposals", href: "/homeowner/proposals", icon: Briefcase },
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          style={{ touchAction: "none" }}
          aria-hidden="true"
        />
      )}

      <div
        className={`
        fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-64
        lg:translate-x-0 lg:z-50 lg:h-[calc(100vh-4rem)] lg:top-16
        lg:group
        ${isCollapsed ? "lg:w-16" : "lg:w-64"}
        lg:hover:w-64
        overflow-hidden
        shadow-2xl lg:shadow-none
        `}
        role="navigation"
        aria-label="Main navigation"
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
          <div className="relative py-2 px-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden absolute top-1 right-1 cursor-pointer p-1 h-7 w-7 rounded-full hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 text-gray-600" />
            </Button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden min-h-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`
                      w-full transition-colors overflow-hidden cursor-pointer
                      ${
                        isActive(item.href)
                          ? "bg-gray-900 text-white hover:bg-black"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                      justify-start px-3 py-3
                      ${
                        isCollapsed
                          ? "lg:justify-center lg:px-2"
                          : "lg:justify-start lg:px-3"
                      }
                      lg:group-hover:justify-start lg:group-hover:px-3
                    `}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <Icon
                      className={`
                        h-5 w-5 transition-all duration-300 flex-shrink-0 mr-3
                        ${isCollapsed ? "lg:mr-0" : "lg:mr-3"}
                        lg:group-hover:mr-3
                      `}
                    />
                    <span
                      className={`
                        transition-all duration-300 overflow-hidden block
                        ${isCollapsed ? "lg:hidden" : "lg:block"}
                        lg:group-hover:block
                      `}
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
