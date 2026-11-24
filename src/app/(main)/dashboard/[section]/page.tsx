import Link from "next/link";
import {notFound} from "next/navigation";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import {config,errorMessage,requireStaff,zd} from "@/lib/zendesk";
import {displayKey,resources,valueText,type RecordRow} from "@/lib/zendesk-resources";
import {Overview} from "../_components/overview";
import {RefreshButton} from "../_components/refresh-button";
const native=(base:string,section:string,row:RecordRow):string|undefined=>{
 if(section==="tickets"&&row.id)return base+"/agent/tickets/"+row.id;
 if(["customers","staff"].includes(section)&&row.id)return base+"/agent/users/"+row.id;
 if(section==="organizations"&&row.id)return base+"/agent/organizations/"+row.id+"/tickets";
};
export default async function Page({params,searchParams}:{params:Promise<{section:string}>;searchParams:Promise<{after?:string;page?:string;before?:string}>}){
 const {section}=await params;const query=await searchParams;const {token,user}=await requireStaff();
 if(section==="overview")return <Overview token={token} name={user.name}/>;
 if(section==="settings")return <div className="space-y-4"><h1 className="text-2xl font-semibold">Zendesk integration</h1><Card><CardHeader><CardTitle>Connection</CardTitle><CardDescription>Authenticated directly against Zendesk users/me.</CardDescription></CardHeader><CardContent className="space-y-2 text-sm"><p>Account: {config().base}</p><p>Signed in as: {user.name} ({user.role})</p><p>Data source: Zendesk API · no local business database</p><p>Refresh: every 30 seconds while visible; manual refresh available.</p><p>Order object: {process.env.ZENDESK_ORDER_OBJECT_KEY||"Not configured"}</p><p>Product object: {process.env.ZENDESK_PRODUCT_OBJECT_KEY||"Not configured"}</p><a className="underline" href={config().base+"/admin"} target="_blank" rel="noreferrer">Open Zendesk Admin Center</a></CardContent></Card></div>;
 const all=resources();if(!Object.hasOwn(all,section))notFound();const resource=all[section];
 let rows:RecordRow[]=[];let error="";let next:string|undefined;let prev:string|undefined;
 if(!resource.endpoint)error="Configure the exact Zendesk custom object key in the server environment. Discover the key in Custom objects.";
 else try{
 const url=new URL(resource.endpoint,config().base);url.searchParams.set("page[size]","50");
 if(query.after)url.searchParams.set("page[after]",query.after);else if(query.before)url.searchParams.set("page[before]",query.before);else if(query.page&&/^\d+$/.test(query.page)){url.searchParams.delete("page[size]");url.searchParams.set("page",query.page);}
 const data=await zd<Record<string,unknown>>(token,url.pathname+url.search);
 if(!Array.isArray(data[resource.key]))throw new Error("Unexpected Zendesk response");rows=data[resource.key] as RecordRow[];
 const links=data.links as {next?:string;prev?:string}|undefined;const metadata=data.meta as {has_more?:boolean}|undefined;
 const paging=(link:unknown)=>{if(typeof link!=="string")return;const u=new URL(link,config().base);if(u.origin!==config().base||u.pathname!==url.pathname)return;const a=u.searchParams.get("page[after]"),b=u.searchParams.get("page[before]"),p=u.searchParams.get("page");return a?"?after="+encodeURIComponent(a):b?"?before="+encodeURIComponent(b):p?"?page="+encodeURIComponent(p):undefined;};
 next=metadata?.has_more===false?undefined:paging(links?.next||data.next_page);prev=paging(links?.prev||data.previous_page);
 }catch(e){error=errorMessage(e);}
 return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">{resource.title}</h1><p className="text-sm text-muted-foreground">{resource.description}</p></div><div className="flex gap-2"><RefreshButton/>{section==="tickets"&&<a className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" href={config().base+"/agent/tickets/new"} target="_blank" rel="noreferrer">New ticket in Zendesk</a>}</div></div><Card><CardHeader><CardTitle>{resource.title}</CardTitle><CardDescription>{error?"Data unavailable":rows.length+" records on this page · Live Zendesk API"}</CardDescription></CardHeader><CardContent>{error?<p role="alert" className="rounded-md border p-4 text-sm">{error}</p>:<><Table><TableHeader><TableRow>{resource.columns.map(k=><TableHead key={k} className="capitalize">{displayKey(k)}</TableHead>)}<TableHead>Record</TableHead></TableRow></TableHeader><TableBody>{rows.map((row,i)=><TableRow key={String(row.id||row.key||i)}>{resource.columns.map(k=><TableCell key={k} className="max-w-72 whitespace-normal break-words">{section==="tickets"&&k==="subject"?<Link className="font-medium underline-offset-4 hover:underline" href={"/dashboard/tickets/"+row.id}>{valueText(row[k])}</Link>:valueText(row[k])}</TableCell>)}<TableCell>{native(config().base,section,row)?<a className="underline" href={native(config().base,section,row)} target="_blank" rel="noreferrer">Zendesk</a>:<details><summary className="cursor-pointer">Metadata</summary><pre className="max-w-96 overflow-x-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(row,null,2)}</pre></details>}</TableCell></TableRow>)}</TableBody></Table>{!rows.length&&<p className="py-8 text-center text-sm text-muted-foreground">No records returned by Zendesk.</p>}<div className="mt-4 flex gap-3 text-sm">{prev&&<Link className="rounded-md border px-3 py-2" href={prev}>Previous</Link>}{next&&<Link className="rounded-md border px-3 py-2" href={next}>Next</Link>}</div></>}</CardContent></Card></div>;
}
