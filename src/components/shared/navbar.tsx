"use client";

import { useState } from "react";
import { User, LogOut, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 px-4 w-full flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Link href={`/${user?.role}/dashboard`} className="cursor-pointer">
              <Image
                src="/images/brand/app-icon.png"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </Link>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.user_metadata?.full_name ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </span>
            </Button>

            {showUserMenu ? (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.user_metadata?.role || user?.role || "User"}
                  </p>
                </div>

                <Link
                  href={`/${
                    user?.user_metadata?.role || user?.role || "homeowner"
                  }/profile`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>

                <div className="border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
