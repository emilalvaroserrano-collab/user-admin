import type {ReactNode} from "react";
import {cookies} from "next/headers";
import {AppSidebar} from "./_components/sidebar/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {SidebarInset,SidebarProvider,SidebarTrigger} from "@/components/ui/sidebar";
import {requireStaff} from "@/lib/zendesk";
import {LiveRefresh} from "./_components/live-refresh";
import {getPreference} from "@/server/server-actions";
import {LayoutControls} from "./_components/header/layout-controls";
import {SearchDialog} from "./_components/header/search-dialog";
import {ThemeSwitcher} from "./_components/header/theme-switcher";
export const dynamic="force-dynamic";
export default async function Layout({children}:Readonly<{children:ReactNode}>){
 const {user}=await requireStaff();
 const defaultOpen=(await cookies()).get("sidebar_state")?.value!=="false";
 const [variant,collapsible]=await Promise.all([getPreference("sidebar_variant"),getPreference("sidebar_collapsible")]);
 return <SidebarProvider defaultOpen={defaultOpen} style={{"--sidebar-width":"calc(var(--spacing) * 68)"} as React.CSSProperties}><AppSidebar variant={variant} collapsible={collapsible}/><SidebarInset className="min-w-0 overflow-x-clip [html[data-content-layout=centered]_&>*]:mx-auto [html[data-content-layout=centered]_&>*]:w-full [html[data-content-layout=centered]_&>*]:max-w-screen-2xl"><header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4 [html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:bg-background"><div className="flex items-center gap-2"><SidebarTrigger/><Separator orientation="vertical" className="h-4"/><SearchDialog/></div><div className="flex items-center gap-2"><LayoutControls/><ThemeSwitcher/><span className="hidden text-xs text-muted-foreground sm:inline">{user.name} · {user.role}</span><form method="post" action="/api/zendesk/logout"><button className="rounded-md border px-2 py-1 text-xs">Sign out</button></form></div></header><div className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 md:p-6"><LiveRefresh/>{children}</div></SidebarInset></SidebarProvider>;
}
