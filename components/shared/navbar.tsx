"use client";

import { UserMenu } from "./UserMenu";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 px-4 w-full flex items-center">
      <div className={cn(
        "flex items-center justify-between w-full",
        isHomePage && "max-w-7xl mx-auto"
      )}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Link href={`/`} className="cursor-pointer">
              <Image
                src={isHomePage ? "/images/brand/logo.png" : "/images/brand/app-icon.png"}
                alt="Logo"
                width={isHomePage ? 120 : 32}
                height={isHomePage ? 100 : 32}
                className={cn(
                  isHomePage ? "w-full h-auto" : "w-8 h-8"
                )}
              />
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dashboard Link - Only show on home page */}
          {isHomePage &&  user && (
            <Link 
              href={`/${user?.user_metadata?.role || user?.role || 'homeowner'}/dashboard`}
              className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
          )}
          
          {/* Auth Buttons - Only show when not authenticated */}
          {!user && (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-sm font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-sm font-medium bg-orange-600 hover:bg-orange-700">
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
