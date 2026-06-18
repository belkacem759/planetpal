"use client"

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layouts/header";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout = React.forwardRef<HTMLDivElement, MainLayoutProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cn("min-h-screen flex flex-col", className)}
        ref={ref}
        {...props}
      >
        {/* Header/Navbar */}
        <Header />

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
                        clipRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        fillRule="evenodd"
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
                    <Link className="text-muted-foreground hover:text-primary transition-colors" href="/products">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link className="text-muted-foreground hover:text-primary transition-colors" href="/products?category=indoor-plants">
                      Indoor Plants
                    </Link>
                  </li>
                  <li>
                    <Link className="text-muted-foreground hover:text-primary transition-colors" href="/products?category=outdoor-plants">
                      Outdoor Plants
                    </Link>
                  </li>
                  <li>
                    <Link className="text-muted-foreground hover:text-primary transition-colors" href="/products?category=plant-care">
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
                    <a className="text-muted-foreground hover:text-primary transition-colors" href="#">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a className="text-muted-foreground hover:text-primary transition-colors" href="#">
                      Shipping Info
                    </a>
                  </li>
                  <li>
                    <a className="text-muted-foreground hover:text-primary transition-colors" href="#">
                      Returns
                    </a>
                  </li>
                  <li>
                    <a className="text-muted-foreground hover:text-primary transition-colors" href="#">
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
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                    placeholder="Enter your email"
                    type="email"
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



export { MainLayout };
export type { MainLayoutProps };