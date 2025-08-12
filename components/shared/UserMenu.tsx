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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { capitalizeWords } from '@/lib/helpers'

export function UserMenu() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // Only render for authenticated users
  if (!user) {
    return null
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase()
      }
      return names[0][0].toUpperCase()
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-11 w-11 cursor-pointer ring-2 ring-gray-200 hover:ring-orange-300 transition-all duration-200 hover:scale-105">
          <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} />
          <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 font-semibold text-lg">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 p-1.5" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-2.5 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg mb-1.5 relative">
          {/* Role Badge - Top Right Corner */}
          <div className="absolute top-1 right-1">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500 text-white capitalize">
              {user?.user_metadata?.role || user?.role || "User"}
            </span>
          </div>
          
          {/* User Info - Left Side */}
          <div className="flex flex-col space-y-1 pr-8">
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
              <p className="text-base font-semibold leading-tight text-gray-800 truncate">
                {capitalizeWords(user?.user_metadata?.full_name) || "User"}
              </p>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <p className="text-xs leading-tight text-gray-600 truncate whitespace-nowrap">
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="my-1.5" />
        
        <DropdownMenuItem asChild className="p-2 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors">
          <Link
            href={`/${
              user?.user_metadata?.role || user?.role || "homeowner"
            }/profile`}
            className="cursor-pointer flex items-center w-full"
          >
            <User className="mr-2 h-4 w-4 text-orange-600" />
            <span className="font-medium">Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="p-2 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors">
          <Link
            href={`/${
              user?.user_metadata?.role || user?.role || "homeowner"
            }/settings`}
            className="cursor-pointer flex items-center w-full"
          >
            <Settings className="mr-2 h-4 w-4 text-orange-600" />
            <span className="font-medium">Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-1.5" />
        
        <DropdownMenuItem
          onClick={handleSignOut}
          className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
