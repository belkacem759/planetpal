'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Menu } from 'lucide-react';
import { Button } from '../ui/button';

interface ShopLayoutProps {
  children?: React.ReactNode; // Main content area (product grid)
  sidebar?: React.ReactNode; // Sidebar content (filters)
  header?: React.ReactNode; // Optional header content
  isSidebarOpenDefault?: boolean; // Default sidebar state
  className?: string; // Optional additional classes
}

const ShopLayout = ({
  children,
  sidebar,
  header,
  isSidebarOpenDefault = true,
  className,
}: ShopLayoutProps) => {
  // State for sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(isSidebarOpenDefault);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  
  // Handle window resize to auto-show sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1024;
      setIsLargeScreen(isLarge);
      
      if (isLarge) {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isLargeScreen) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isLargeScreen) return;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isLargeScreen) return;
    
    const touchDiff = touchCurrentX.current - touchStartX.current;
    const threshold = 50; // Minimum swipe distance
    
    // Swipe right to open sidebar (when closed)
    if (touchDiff > threshold && !isSidebarOpen && touchStartX.current < 50) {
      setIsSidebarOpen(true);
    }
    // Swipe left to close sidebar (when open)
    else if (touchDiff < -threshold && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isSidebarOpen && !isLargeScreen) {
      setIsSidebarOpen(false);
    }
  };

  // Focus management for accessibility
  useEffect(() => {
    if (!isLargeScreen && isSidebarOpen) {
      // Focus the sidebar when it opens on mobile
      const sidebar = sidebarRef.current;
      if (sidebar) {
        sidebar.focus();
      }
    }
  }, [isSidebarOpen, isLargeScreen]);
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  return (
    <div 
      className={`w-full min-h-[calc(100vh-4rem)] ${className || ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Optional header */}
      {header && (
        <div className="w-full py-4 px-4 md:px-6">
          {header}
        </div>
      )}
      
      <div className="relative flex flex-col lg:flex-row w-full">
        {/* Mobile sidebar toggle - Improved for better mobile UX */}
        <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 flex items-center px-4 mb-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close filters" : "Open filters"}
            aria-expanded={isSidebarOpen}
            aria-controls="filters-sidebar"
            className="shrink-0"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{isSidebarOpen ? "Close" : "Open"} filters</span>
          </Button>
          <span className="ml-2 font-medium">Filters</span>
        </div>
        
        {/* Sidebar - Filter Panel */}
        <aside 
          ref={sidebarRef}
          id="filters-sidebar"
          className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:relative lg:translate-x-0 top-0 left-0 z-40 
            h-screen lg:h-auto lg:min-h-[calc(100vh-8rem)] 
            w-[85%] sm:w-[350px] lg:w-1/4 xl:w-1/5
            bg-white dark:bg-gray-900 
            overflow-y-auto
            transition-transform duration-300 ease-in-out
            border-r border-gray-200 dark:border-gray-800
            p-4 focus-within:ring-2 focus-within:ring-blue-500
          `}
          aria-expanded={isSidebarOpen}
          aria-label="Product filters"
          role="complementary"
          tabIndex={isSidebarOpen ? 0 : -1}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Mobile close button */}
          <div className="flex justify-between items-center mb-4 lg:hidden sticky top-0 bg-white dark:bg-gray-900 z-10 py-2">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              aria-label="Close filters"
              tabIndex={isSidebarOpen ? 0 : -1}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close filters</span>
            </Button>
          </div>
          
          {/* Sidebar content */}
          <div className="pb-20 lg:pb-0">
            {sidebar}
          </div>
        </aside>
        
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && !isLargeScreen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ease-in-out" 
            onClick={toggleSidebar}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                toggleSidebar();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close filters overlay"
          />
        )}
        
        {/* Main content area */}
        <main 
          className="flex-1 p-4 md:p-6 min-w-0 focus:outline-none"
          role="main"
          aria-label="Product listings"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main content */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default ShopLayout;