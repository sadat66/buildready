"use client"

import React from "react";
import { cn } from "@/lib/utils";

interface RandomAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const generateSeed = (name: string): number => {
  return name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const getRandomColor = (name: string): string => {
  const colors = [
    "#FF6B35", "#FF8C42", "#FFA500", "#FFB347", // Orange variations
    "#FF8A65", "#FF7043", "#FF5722", "#E65100", // Deep orange
    "#FF9800", "#FFB74D", "#FFCC02", "#FFD54F", // Amber & yellow-orange
    "#FF6F00", "#FF8F00", "#FFA000", "#FFB300", // Orange-amber
    "#FF5722", "#FF7043", "#FF8A65", "#FFAB91", // Red-orange
    "#F57C00", "#FF9800", "#FFB74D", "#FFCC02", // Orange to amber
    "#E65100", "#F57C00", "#FF8F00", "#FFA000"  // Deep orange variations
  ];
  const seed = generateSeed(name);
  return colors[seed % colors.length];
};

const getRandomStyle = (name: string): number => {
  const seed = generateSeed(name);
  return seed % 6; // 6 different styles
};

export const RandomAvatar: React.FC<RandomAvatarProps> = ({ 
  name, 
  size = 48, 
  className 
}) => {
  const initials = getInitials(name);
  const bgColor = getRandomColor(name);
  const style = getRandomStyle(name);
  
  const sizeClasses: Record<number, string> = {
    24: "w-6 h-6",
    32: "w-8 h-8", 
    40: "w-10 h-10",
    48: "w-12 h-12",
    56: "w-14 h-14",
    64: "w-16 h-16"
  };

  const renderAvatar = () => {
    switch (style) {
      case 0: // Geometric
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill={bgColor} />
            <circle cx="25" cy="25" r="15" fill="#ffffff" opacity="0.3" />
            <rect x="60" y="20" width="20" height="20" fill="#ffffff" opacity="0.2" />
            <polygon points="50,70 70,90 30,90" fill="#ffffff" opacity="0.4" />
          </svg>
        );
      case 1: // Abstract
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill={bgColor} />
            <path d="M0,50 Q25,25 50,50 T100,50 L100,100 L0,100 Z" fill="#ffffff" opacity="0.3" />
            <circle cx="30" cy="30" r="8" fill="#ffffff" opacity="0.5" />
            <circle cx="70" cy="70" r="12" fill="#ffffff" opacity="0.4" />
          </svg>
        );
      case 2: // Minimal
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill={bgColor} />
            <rect x="20" y="20" width="60" height="60" fill="#ffffff" opacity="0.2" rx="8" />
            <circle cx="35" cy="35" r="4" fill="#ffffff" opacity="0.6" />
            <circle cx="65" cy="35" r="4" fill="#ffffff" opacity="0.6" />
            <path d="M30,60 Q50,70 70,60" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.7" />
          </svg>
        );
      case 3: // Gradient-like
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill={bgColor} />
            <circle cx="50" cy="50" r="25" fill="#ffffff" opacity="0.2" />
            <circle cx="25" cy="25" r="8" fill="#ffffff" opacity="0.5" />
            <circle cx="75" cy="75" r="8" fill="#ffffff" opacity="0.5" />
          </svg>
        );
      case 4: // Organic
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill={bgColor} />
            <path d="M0,30 Q20,10 40,30 T80,30 L80,100 L0,100 Z" fill="#ffffff" opacity="0.3" />
            <path d="M20,20 Q40,5 60,20 T100,20 L100,100 L20,100 Z" fill="#ffffff" opacity="0.2" />
            <circle cx="35" cy="40" r="6" fill="#ffffff" opacity="0.6" />
            <circle cx="65" cy="60" r="6" fill="#ffffff" opacity="0.6" />
          </svg>
        );
      case 5: // Tech
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill={bgColor} />
            <rect x="15" y="15" width="70" height="70" fill="#ffffff" opacity="0.2" stroke="#ffffff" strokeWidth="2" />
            <rect x="25" y="25" width="50" height="30" fill="#ffffff" opacity="0.3" />
            <rect x="30" y="35" width="8" height="8" fill={bgColor} />
            <rect x="45" y="35" width="8" height="8" fill={bgColor} />
            <rect x="60" y="35" width="8" height="8" fill={bgColor} />
            <rect x="35" y="50" width="30" height="3" fill="#ffffff" opacity="0.6" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill={bgColor} />
            <circle cx="50" cy="50" r="30" fill="#ffffff" opacity="0.2" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center",
        sizeClasses[size] || "w-12 h-12",
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full">
        {renderAvatar()}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-semibold" style={{
          fontSize: `${Math.max(size * 0.3, 12)}px`,
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}>
          {initials}
        </span>
      </div>
    </div>
  );
};

export default RandomAvatar;
