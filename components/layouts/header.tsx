"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useCartQuery } from "@/hooks";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Heart, LogIn, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface HeaderProps {
  className?: string;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, ...props }, ref) => {
    const { data: cart, isLoading } = useCartQuery();
    const cartItemCount = cart?.items?.length || 0;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [user, setUser] = React.useState<SupabaseUser | null>(null);

    React.useEffect(() => {
      const supabase = createClient();
      
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      };

      getUser();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }, []);

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Navigation Links */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-bold text-xl">PlanetPal</span>
              </Link>

              {/* Navigation Links - Hidden on mobile */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Shop
                </Link>
                <Link
                  href="/categories"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </nav>
            </div>

            {/* Right Side Icons with Search */}
            <div className="flex items-center space-x-4">
              {/* Search Bar - Expandable */}
              <div className="hidden md:flex items-center group">
                <div className="relative w-64 focus-within:w-80 hover:w-80 transition-all duration-300 ease-in-out">
                  <Search color="#638773" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search plants, pots, tools..."
                    className="pl-10 pr-4 w-full h-10 placeholder:text-[#638773] rounded-full border-2 border-gray-200 bg-[#F0F5F2] focus:bg-white focus:border-green-500 transition-all duration-200"
                  />
                </div>
              </div>
              {/* Favorites Icon */}
              <Link href="/favorite" className="hidden md:block">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              {/* Cart Icon with Badge */}
              <Link href="/cart" className="hidden md:block">
                <Button variant="ghost" size="icon" className="relative">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {cartItemCount > 99 ? "99+" : cartItemCount}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>

              {/* Theme Switcher */}
              <div className="hidden md:block">
                <ThemeSwitcher />
              </div>

              {/* Authentication Section */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48"
                  >
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-plants">My Plants</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reminders">Reminders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                      }}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search plants, pots, tools..."
                className="pl-10 pr-4 w-full h-10 rounded-full bg-gray-50 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed top-0 right-0 h-full w-64 bg-background border-l shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="p-4 space-y-4">
                <Link
                  href="/"
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  href="/categories"
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="border-t pt-4 space-y-2">
                  <Link
                    href="/favorite"
                    className="flex items-center py-2 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Favorites
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center justify-between py-2 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Cart
                    </div>
                    {cartItemCount > 0 && (
                      <Badge variant="destructive">
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/my-plants"
                    className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Plants
                  </Link>
                  <Link
                    href="/profile"
                    className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/reminders"
                    className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Reminders
                  </Link>
                  {user ? (
                    <button 
                      className="block w-full text-left py-2 text-lg font-medium transition-colors hover:text-primary"
                      onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">Theme</span>
                      <ThemeSwitcher />
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    );
  }
);
Header.displayName = "Header";

export { Header };
export type { HeaderProps };

