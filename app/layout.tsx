import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, Upload, BarChart3, ShoppingCart, Settings, TrendingDown, LineChart } from "lucide-react"
import Link from "next/link"
import { AppProvider } from "@/lib/context/app-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stock Zesta - Smart insights for fresh goods",
  description: "AI-powered dynamic pricing system to reduce food waste and maximize revenue",
    generator: 'Stock Zesta'
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Upload Dataset",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Inventory",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "POS Simulation",
    url: "/pos",
    icon: ShoppingCart,
  },
  {
    title: "Analysis",
    url: "/analysis",
    icon: LineChart,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <TrendingDown className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">Stock Zesta</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-4 text-xs text-muted-foreground">© 2024 Stock Zesta</div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-blue-600 text-white">
                <SidebarTrigger className="-ml-1 text-white" />
                <div className="ml-2 font-semibold">Smart insights for fresh goods</div>
              </header>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </AppProvider>
      </body>
    </html>
  )
}
