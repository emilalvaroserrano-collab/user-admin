import "server-only";
import {createCipheriv,createDecipheriv,randomBytes} from "node:crypto";
import {cache} from "react";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
export const SESSION="mts_session";
export const STATE="mts_oauth_state";
export const sessionOptions={httpOnly:true,sameSite:"lax" as const,secure:process.env.NODE_ENV==="production",path:"/"};
export function config(){
 const subdomain=process.env.ZENDESK_SUBDOMAIN||"";
 const origin=process.env.APP_ORIGIN||(process.env.NODE_ENV==="development"?"http://localhost:3000":"");
 const clientId=process.env.ZENDESK_CLIENT_ID||"";
 const secret=process.env.ZENDESK_CLIENT_SECRET||"";
 const scope=process.env.ZENDESK_SCOPE||"read write";
 if(!/^[a-z0-9][a-z0-9-]*$/i.test(subdomain)||!clientId||!secret||!/^[a-f0-9]{64}$/i.test(process.env.SESSION_SECRET||""))throw new Error("Zendesk configuration incomplete");
 const app=new URL(origin);
 const mode=process.env.ZENDESK_AUTH_MODE||"authorization_code";
 if(mode!=="authorization_code" && !(mode==="client_credentials" && process.env.NODE_ENV==="development" && !process.env.VERCEL && ["http://localhost:3000","http://127.0.0.1:3000"].includes(origin)))throw new Error("Invalid authentication mode for environment");
 const local=["localhost","127.0.0.1"].includes(app.hostname);
 if(app.origin!==origin || (app.protocol!=="https:" && !(process.env.NODE_ENV==="development"&&!process.env.VERCEL&&local&&app.protocol==="http:")))throw new Error("Invalid APP_ORIGIN");
 return {base:"https://"+subdomain+".zendesk.com",origin,callback:origin+"/api/zendesk/oauth/callback",clientId,secret,scope};
}
export function localAuthEnabled(){
 if(process.env.NODE_ENV!=="development"||process.env.VERCEL||process.env.ZENDESK_AUTH_MODE!=="client_credentials")return false;
 try{return ["http://localhost:3000","http://127.0.0.1:3000"].includes(config().origin);}catch{return false;}
}
function key(){config();return Buffer.from(process.env.SESSION_SECRET!,"hex");}
export function seal(value:object){
 const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",key(),iv);
 const data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);
 return Buffer.concat([iv,cipher.getAuthTag(),data]).toString("base64url");
}
export function unseal<T>(value:string|undefined):T|null{
 if(!value)return null;
 try{const b=Buffer.from(value,"base64url");const cipher=createDecipheriv("aes-256-gcm",key(),b.subarray(0,12));cipher.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([cipher.update(b.subarray(28)),cipher.final()]).toString()) as T;}catch{return null;}
}
export type ZendeskUser={id:number;name:string;email:string;role:string;suspended?:boolean};
export class ZendeskError extends Error{constructor(public status:number,public retryAfter:string|null=null){super("Zendesk request failed ("+status+")");}}
export async function zd<T>(token:string,path:string,init:RequestInit={}):Promise<T>{
 const base=config().base;
 const url=new URL(path,base);
 if(url.origin!==base||!url.pathname.startsWith("/api/v2/"))throw new Error("Invalid Zendesk API path");
 const response=await fetch(url,{...init,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(15000),headers:{Accept:"application/json",Authorization:"Bearer "+token,...(init.body?{"Content-Type":"application/json"}:{})}});
 if(!response.ok)throw new ZendeskError(response.status,response.headers.get("retry-after"));
 return response.json() as Promise<T>;
}
export async function me(token:string){return (await zd<{user:ZendeskUser}>(token,"/api/v2/users/me.json")).user;}
export function isStaff(user:ZendeskUser|undefined){return !!user&&!user.suspended&&["admin","agent"].includes(user.role);}
export function isLocalAdmin(user:ZendeskUser|undefined){
 const expected=process.env.ZENDESK_OWNER_EMAIL?.trim().toLowerCase();
 return !!user&&!user.suspended&&user.role==="admin"&&(!expected||user.email?.trim().toLowerCase()===expected);
}
export const requireStaff=cache(async function(){
 const session=unseal<{token:string;exp:number;mode:"local"|"oauth"}>((await cookies()).get(SESSION)?.value);
 if(!session||session.exp<=Date.now()||typeof session.token!=="string"||(session.mode!=="oauth"&&!(session.mode==="local"&&localAuthEnabled())))redirect("/production/signin");
 let user:ZendeskUser;
 try{user=await me(session.token);}catch(e){if(e instanceof ZendeskError&&[401,403].includes(e.status))redirect("/production/signin?error=session");throw e;}
 if(!isStaff(user)||(session.mode==="local"&&!isLocalAdmin(user)))redirect("/production/signin?error=role");
 return {token:session.token,user};
});
export function errorMessage(e:unknown){
 if(e instanceof ZendeskError)return e.status===429?"Zendesk rate limit reached. Retry after "+(e.retryAfter||"a short delay")+" seconds.":"Zendesk returned HTTP "+e.status+". Check role, OAuth scopes, plan, and resource configuration.";
 return "Unable to reach Zendesk. Check configuration and network connection.";
}
export async function tokenRequest(body:Record<string,string>){
 const c=config();
 const response=await fetch(c.base+"/oauth/tokens",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...body,client_id:c.clientId,client_secret:c.secret}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new ZendeskError(response.status);
 const data=await response.json();
 if(typeof data.access_token!=="string"||!data.access_token)throw new Error("No OAuth access token returned");
 return {token:data.access_token as string,maxAge:Math.min(28800,typeof data.expires_in==="number"&&data.expires_in>0?Math.floor(data.expires_in):1800)};
}
