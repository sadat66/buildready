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
            className="cursor-pointer ring-2 ring-gray-200 hover:ring-gray-400 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
          />
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72 p-2 bg-white border border-gray-200 shadow-2xl rounded-2xl" align="end" forceMount>
        {/* Enhanced Header with Clean Background */}
        <DropdownMenuLabel className="font-normal p-4 bg-gray-50 rounded-xl mb-2 relative overflow-hidden">
          {/* User Info - Clean and Centered */}
          <div className="relative z-10 flex flex-col space-y-2 items-center text-center">
            <p className="text-lg font-bold leading-tight text-gray-900 truncate">
              {capitalizeWords(user?.full_name || user?.user_metadata?.full_name) || "User"}
            </p>
            {/* Role Badge - Under name */}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-white capitalize shadow-sm">
              {user?.user_role || user?.user_metadata?.role || "User"}
            </span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="my-2 bg-gray-200" />
        
        {/* Enhanced Menu Items */}
        <DropdownMenuItem asChild className="p-3 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group">
          <Link
            href={`/${
              user?.user_metadata?.role || user?.user_role || "homeowner"
            }/profile`}
            className="cursor-pointer flex items-center w-full"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-all duration-200">
              <User className="h-4 w-4 text-gray-900" />
            </div>
            <span className="font-semibold">Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="p-3 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group">
          <Link
            href={`/${
              user?.user_metadata?.role || user?.user_role || "homeowner"
            }/settings`}
            className="cursor-pointer flex items-center w-full"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-all duration-200">
              <Settings className="h-4 w-4 text-gray-900" />
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
