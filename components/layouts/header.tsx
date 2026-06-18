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
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Navigation Links */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link className="flex items-center space-x-2 shrink-0" href="/">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-bold text-xl">PlanetPal</span>
              </Link>

              {/* Navigation Links - Hidden on mobile */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  className="text-sm font-medium transition-colors hover:text-primary"
                  href="/"
                >
                  Home
                </Link>
                <Link
                  className="text-sm font-medium transition-colors hover:text-primary"
                  href="/shop"
                >
                  Shop
                </Link>
                <Link
                  className="text-sm font-medium transition-colors hover:text-primary"
                  href="/categories"
                >
                  Categories
                </Link>
                <Link
                  className="text-sm font-medium transition-colors hover:text-primary"
                  href="/about"
                >
                  About
                </Link>
                <Link
                  className="text-sm font-medium transition-colors hover:text-primary"
                  href="/contact"
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" color="#638773" />
                  <Input
                    className="pl-10 pr-4 w-full h-10 placeholder:text-[#638773] rounded-full border-2 border-gray-200 bg-[#F0F5F2] focus:bg-white focus:border-green-500 transition-all duration-200"
                    placeholder="Search plants, pots, tools..."
                    type="text"
                  />
                </div>
              </div>
              {/* Favorites Icon */}
              <Link className="hidden md:block" href="/favorite">
                <Button className="relative" size="icon" variant="ghost">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              {/* Cart Icon with Badge */}
              <Link className="hidden md:block" href="/cart">
                <Button className="relative" size="icon" variant="ghost">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemCount > 0 && (
                        <Badge
                          className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          variant="destructive"
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
                      size="icon" 
                      variant="ghost"
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
                <Button asChild size="sm" variant="default">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                size="icon"
                variant="ghost"
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
                className="pl-10 pr-4 w-full h-10 rounded-full bg-gray-50 focus:bg-white transition-all duration-200 placeholder:text-gray-400"
                placeholder="Search plants, pots, tools..."
                type="text"
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="p-4 space-y-4">
                <Link
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  href="/categories"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="border-t pt-4 space-y-2">
                  <Link
                    className="flex items-center py-2 text-lg font-medium transition-colors hover:text-primary"
                    href="/favorite"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Favorites
                  </Link>
                  <Link
                    className="flex items-center justify-between py-2 text-lg font-medium transition-colors hover:text-primary"
                    href="/cart"
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
                    className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                    href="/my-plants"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Plants
                  </Link>
                  <Link
                    className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                    href="/reminders"
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
                      className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                      href="/login"
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

