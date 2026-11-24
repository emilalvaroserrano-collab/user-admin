import {LayoutDashboard,Ticket,Users,Building2,Layers,Package,ShoppingBag,Settings,ListFilter,BookOpen,type LucideIcon} from "lucide-react";
export type NavBadge="new"|"updated"|"soon";
export interface NavSubItem{id:string;title:string;url:string;icon?:LucideIcon;badge?:NavBadge;disabled?:boolean;newTab?:boolean}
interface NavItemBase{id:string;title:string;icon?:LucideIcon;badge?:NavBadge;disabled?:boolean;newTab?:boolean}
export interface NavMainLinkItem extends NavItemBase{url:string;subItems?:never}
export interface NavMainParentItem extends NavItemBase{subItems:NavSubItem[]}
export type NavMainItem=NavMainLinkItem|NavMainParentItem;
export interface NavGroup{id:number;label?:string;items:NavMainItem[]}
export const sidebarItems:NavGroup[]=[
{id:1,label:"Workspace",items:[{id:"overview",title:"Overview",url:"/dashboard/overview",icon:LayoutDashboard},{id:"tickets",title:"Tickets",url:"/dashboard/tickets",icon:Ticket},{id:"views",title:"Views",url:"/dashboard/views",icon:ListFilter},{id:"customers",title:"Customers",url:"/dashboard/customers",icon:Users},{id:"organizations",title:"Organizations",url:"/dashboard/organizations",icon:Building2}]},
{id:2,label:"Commerce",items:[{id:"orders",title:"Orders",url:"/dashboard/orders",icon:ShoppingBag},{id:"products",title:"Products",url:"/dashboard/products",icon:Package},{id:"objects",title:"Custom objects",url:"/dashboard/objects",icon:Layers}]},
{id:3,label:"Administration",items:[{id:"staff",title:"Staff",url:"/dashboard/staff",icon:Users},{id:"groups",title:"Groups",url:"/dashboard/groups",icon:Users},{id:"fields",title:"Ticket fields",url:"/dashboard/fields",icon:Settings},{id:"forms",title:"Ticket forms",url:"/dashboard/forms",icon:BookOpen},{id:"triggers",title:"Triggers",url:"/dashboard/triggers",icon:Settings},{id:"settings",title:"Integration",url:"/dashboard/settings",icon:Settings}]}
];
