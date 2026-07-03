"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  Repeat,
  Package,
  MapPin,
  Fuel,
  BookOpen,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home, desc: "Overview & tools" },
  { href: "/convert", label: "Convert", icon: Repeat, desc: "Coordinate formats" },
  { href: "/batch", label: "Batch", icon: Package, desc: "CSV / bulk processing" },
  { href: "/my-location", label: "My Location", icon: MapPin, desc: "GPS & IP lookup" },
  { href: "/nearest-pumps", label: "Nearest Pumps", icon: Fuel, desc: "Petrol stations" },
  { href: "/api-docs", label: "API Docs", icon: BookOpen, desc: "REST API reference" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Usage & account" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2.5 rounded-xl bg-background border border-border shadow-sm hover:bg-accent transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out",
          "lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" onClick={close} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              G
            </div>
            <span className="font-bold text-base">GeoBatch</span>
          </Link>
          <button
            onClick={close}
            className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground/70 group-hover:text-accent-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.label}</div>
                  {item.desc && (
                    <div className="text-[11px] text-muted-foreground/50 truncate leading-tight">
                      {item.desc}
                    </div>
                  )}
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <div className="flex items-center gap-0.5">
              {mounted && (
                <>
                  {(
                    [
                      { key: "light", icon: Sun },
                      { key: "dark", icon: Moon },
                      { key: "system", icon: Laptop },
                    ] as const
                  ).map(({ key, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        theme === key
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50",
                      )}
                      title={`${key.charAt(0).toUpperCase() + key.slice(1)} theme`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
