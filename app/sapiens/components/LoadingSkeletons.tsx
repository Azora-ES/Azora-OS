/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.

WORLD-CLASS LOADING SKELETONS FOR EDUCATION PLATFORM
Beautiful animated loading states that match the brand
*/

'use client';

import React from 'react';

/**
 * Base skeleton component with pulse animation
 */
export function Skeleton({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Course card loading skeleton
 */
export function CourseCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20">
      {/* Title */}
      <Skeleton className="h-6 w-3/4 mb-4" />
      
      {/* Description lines */}
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-6" />
      
      {/* Meta info */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Button */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/**
 * Portfolio item loading skeleton
 */
export function PortfolioItemSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-purple-500/20">
      {/* Image placeholder */}
      <Skeleton className="h-40 w-full rounded-none" />
      
      {/* Content */}
      <div className="p-4">
        <Skeleton className="h-5 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        
        {/* Skills */}
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        
        {/* Button */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Leaderboard entry loading skeleton
 */
export function LeaderboardEntrySkeleton() {
  return (
    <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-5 w-24" />
    </div>
  );
}

/**
 * Complete leaderboard loading skeleton
 */
export function LeaderboardSkeleton({ entries = 5 }: { entries?: number }) {
  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-purple-500/20">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {[...Array(entries)].map((_, i) => (
          <LeaderboardEntrySkeleton key={i} />
        ))}
      </div>
      <Skeleton className="w-full h-12 rounded-lg mt-6" />
    </div>
  );
}

/**
 * Dashboard stat card loading skeleton
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4">
      <Skeleton className="h-4 w-12 mb-2 bg-white/20" />
      <Skeleton className="h-8 w-20 mb-1 bg-white/30" />
      <Skeleton className="h-3 w-16 bg-white/20" />
    </div>
  );
}

/**
 * Project/opportunity card skeleton
 */
export function OpportunityCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-8 w-24 mb-4" />
      
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-20 rounded" />
      </div>
      
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/**
 * Mentor card loading skeleton
 */
export function MentorCardSkeleton() {
  return (
    <div className="bg-black/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Study group card loading skeleton
 */
export function StudyGroupCardSkeleton() {
  return (
    <div className="bg-black/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Page loading skeleton with shimmer effect
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated logo/icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse"></div>
          <Skeleton className="relative w-24 h-24 rounded-full mx-auto" />
        </div>
        
        {/* Loading text */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        
        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of loading skeletons
 */
export function GridSkeleton({ 
  count = 6, 
  component: Component = CourseCardSkeleton,
  className = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
}: { 
  count?: number;
  component?: React.ComponentType;
  className?: string;
}) {
  return (
    <div className={`grid ${className} gap-6`}>
      {[...Array(count)].map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

/**
 * List of loading skeletons
 */
export function ListSkeleton({ 
  count = 5, 
  component: Component = LeaderboardEntrySkeleton 
}: { 
  count?: number;
  component?: React.ComponentType;
}) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

/**
 * NFT card loading skeleton
 */
export function NFTCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl overflow-hidden border border-purple-500/20">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="h-5 w-2/3 mb-2" />
        <div className="flex justify-between text-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Simulation card loading skeleton
 */
export function SimulationCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <Skeleton className="h-12 w-12 mb-2 rounded" />
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-3 w-32 mb-2" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}
