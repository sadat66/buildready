'use client'

import { User, LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { capitalizeWords } from '@/lib/helpers'
import RandomAvatar from '@/components/ui/random-avatar'

export default function UserMenu() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // Only render for authenticated users
  if (!user) {
    return null
  }



  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative group">
          <RandomAvatar 
            name={user?.full_name || user?.user_metadata?.full_name || user?.email || "User"}
            size={48}
            className="cursor-pointer ring-2 ring-orange-200 hover:ring-orange-400 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
          />
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72 p-2 bg-white border border-orange-100 shadow-2xl rounded-2xl" align="end" forceMount>
        {/* Enhanced Header with Gradient Background */}
        <DropdownMenuLabel className="font-normal p-4 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 rounded-xl mb-2 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full transform translate-x-6 -translate-y-6"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full transform -translate-x-4 translate-y-4"></div>
          
          {/* User Info - Enhanced */}
          <div className="relative z-10 flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full shadow-sm"></div>
              <p className="text-lg font-bold leading-tight text-gray-800 truncate">
                {capitalizeWords(user?.full_name || user?.user_metadata?.full_name) || "User"}
              </p>
            </div>
            {/* Role Badge - Moved under name */}
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white capitalize shadow-sm">
                {user?.user_role || user?.user_metadata?.role || "User"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="my-2 bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
        
        {/* Enhanced Menu Items */}
        <DropdownMenuItem asChild className="p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 transition-all duration-200 group">
          <Link
            href={`/${
              user?.user_metadata?.role || user?.user_role || "homeowner"
            }/profile`}
            className="cursor-pointer flex items-center w-full"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mr-3 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200">
              <User className="h-4 w-4 text-orange-600" />
            </div>
            <span className="font-semibold">Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="p-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 transition-all duration-200 group">
          <Link
            href={`/${
              user?.user_metadata?.role || user?.user_role || "homeowner"
            }/settings`}
            className="cursor-pointer flex items-center w-full"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mr-3 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200">
              <Settings className="h-4 w-4 text-orange-600" />
            </div>
            <span className="font-semibold">Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-2 bg-gradient-to-r from-transparent via-red-200 to-transparent" />
        
        {/* Enhanced Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="p-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mr-3 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-200">
            <LogOut className="h-4 w-4 text-red-600" />
          </div>
          <span className="font-semibold">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
