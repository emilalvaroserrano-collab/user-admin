"use client";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { AppLogo } from "@/components/app-logo";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { NavMain } from "./nav-main";
export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
 const {sidebarVariant,sidebarCollapsible,isSynced}=usePreferencesStore(useShallow(s=>({sidebarVariant:s.values.sidebar_variant,sidebarCollapsible:s.values.sidebar_collapsible,isSynced:s.isSynced})));
 return <Sidebar {...props} variant={isSynced?sidebarVariant:props.variant} collapsible={isSynced?sidebarCollapsible:props.collapsible}><SidebarHeader><SidebarMenu><SidebarMenuItem><SidebarMenuButton render={<Link prefetch={false} href="/dashboard/overview"/>}><AppLogo/><span className="truncate text-sm font-semibold">{APP_CONFIG.name}</span></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader><SidebarContent><NavMain items={sidebarItems}/></SidebarContent><SidebarFooter><div className="px-2 py-3 text-xs text-muted-foreground">Powered by Zendesk</div></SidebarFooter></Sidebar>;
}
