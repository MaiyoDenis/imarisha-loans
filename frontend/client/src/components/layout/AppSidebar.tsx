import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut,
  Building2,
  Wallet
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import logo from "/image.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Building2, label: "Branches", href: "/branches" },
  { icon: Users, label: "Staff & Users", href: "/users" },
  { icon: Users, label: "Groups", href: "/groups" },
  { icon: Users, label: "Members", href: "/members" },
  { icon: CreditCard, label: "Loans", href: "/loans" },
  { icon: Package, label: "Loan Products", href: "/products" },
  { icon: Wallet, label: "Savings", href: "/savings" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AppSidebar() {
  const [location, navigate] = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <img src={logo} alt="Imarisha" className="h-8 w-8 rounded-md" />
          <span className="text-xl font-heading font-bold tracking-tight group-data-[collapsible=icon]:hidden">Imarisha</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {sidebarItems.map((item) => {
            const isActive = location === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  isActive={isActive} 
                  onClick={() => navigate(item.href)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-md bg-sidebar-accent/50">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xs">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">Super Admin</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            onClick={() => navigate("/")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center p-2">
             <Button 
            variant="ghost" 
            size="icon"
            className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            onClick={() => navigate("/")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
