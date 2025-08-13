"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import UserMenu from "./UserMenu";
import { Menu } from "lucide-react";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  showMobileMenuButton?: boolean;
}

export default function Navbar({
  onMobileMenuToggle,
  showMobileMenuButton = false,
}: NavbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isDashboardPage =
    pathname.includes("/dashboard") ||
    pathname.includes("/homeowner") ||
    pathname.includes("/contractor") ||
    pathname.includes("/admin");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 px-4 w-full flex items-center">
      <div
        className={cn(
          "flex items-center justify-between w-full",
          isHomePage && "max-w-7xl mx-auto"
        )}
      >
        <div className="flex items-center space-x-4">
          {showMobileMenuButton && isDashboardPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="lg:hidden group cursor-pointer p-2 mr-3 h-10 w-10 rounded-lg bg-gray-100 hover:bg-orange-100  transition-colors duration-200"
            >
              <Menu className="h-8 w-8 text-gray-600 group-hover:text-orange-600" />
            </Button>
          )}

          <div className="flex items-center">
            <Link href={`/`} className="cursor-pointer">
              <Image
                src="/images/brand/logo.png"
                alt="Logo"
                width={120}
                height={100}
                className="w-full h-auto"
              />
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isHomePage && user && (
            <Link
              href={`/${
                user?.user_metadata?.role || user?.role || "homeowner"
              }/dashboard`}
              className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          )}

          {!user && (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="text-sm font-medium bg-orange-600 hover:bg-orange-700"
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}

          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
