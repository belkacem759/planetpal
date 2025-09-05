"use client"

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  cartItemCount?: number;
  className?: string;
}

const MainLayout = React.forwardRef<HTMLDivElement, MainLayoutProps>(
  ({ children, cartItemCount = 0, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("min-h-screen flex flex-col", className)}
        {...props}
      >
        {/* Header/Navbar */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-bold text-xl">PlanetPal</span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Products
                </Link>
                <Link
                  href="/cart"
                  className="text-sm font-medium transition-colors hover:text-primary relative"
                >
                  Cart
                  {cartItemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </Badge>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Account
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <MobileMenu cartItemCount={cartItemCount} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                    <svg
                      className="w-4 h-4 text-primary-foreground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-bold">PlanetPal</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your trusted companion for all things green. Discover, grow, and nurture beautiful plants.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-3">
                <h4 className="font-semibold">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=indoor-plants" className="text-muted-foreground hover:text-primary transition-colors">
                      Indoor Plants
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=outdoor-plants" className="text-muted-foreground hover:text-primary transition-colors">
                      Outdoor Plants
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=plant-care" className="text-muted-foreground hover:text-primary transition-colors">
                      Plant Care
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Customer Service */}
              <div className="space-y-3">
                <h4 className="font-semibold">Customer Service</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      Shipping Info
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      Returns
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      Plant Care Guide
                    </a>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div className="space-y-3">
                <h4 className="font-semibold">Stay Connected</h4>
                <p className="text-sm text-muted-foreground">
                  Get plant care tips and exclusive offers.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                  />
                  <Button size="sm">Subscribe</Button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              <p>&copy; 2024 PlanetPal. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
);
MainLayout.displayName = "MainLayout";

// Mobile Menu Component
const MobileMenu: React.FC<{ cartItemCount: number }> = ({ cartItemCount }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-background border-l shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            <nav className="p-4 space-y-4">
              <Link
                href="/"
                className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/cart"
                className="block py-2 text-lg font-medium transition-colors hover:text-primary flex items-center justify-between"
                onClick={() => setIsOpen(false)}
              >
                Cart
                {cartItemCount > 0 && (
                  <Badge variant="destructive">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/profile"
                className="block py-2 text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Account
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export { MainLayout };
export type { MainLayoutProps };