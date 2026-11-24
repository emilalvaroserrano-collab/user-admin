import {randomBytes,createHash} from "node:crypto";
import {NextResponse} from "next/server";
import {config,seal,STATE,sessionOptions} from "@/lib/zendesk";
export const runtime="nodejs";
export async function GET(req:Request){
 try{
 const c=config();
 if(process.env.VERCEL && new URL(req.url).origin!==c.origin)return NextResponse.redirect(c.origin+"/production/signin",303);
 const state=randomBytes(32).toString("base64url");const verifier=randomBytes(48).toString("base64url");
 const url=new URL(c.base+"/oauth/authorizations/new");
 url.search=new URLSearchParams({response_type:"code",client_id:c.clientId,redirect_uri:c.callback,scope:c.scope,state,code_challenge:createHash("sha256").update(verifier).digest("base64url"),code_challenge_method:"S256"}).toString();
 const res=NextResponse.redirect(url);res.cookies.set(STATE,seal({state,verifier,exp:Date.now()+600000}),{...sessionOptions,maxAge:600});return res;
 }catch{return new NextResponse(null,{status:303,headers:{Location:"/production/signin?error=config"}});}
}
