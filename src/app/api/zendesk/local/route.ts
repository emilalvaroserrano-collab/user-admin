import {NextResponse} from "next/server";
import {config,localAuthEnabled,tokenRequest,me,seal,SESSION,sessionOptions,ZendeskError} from "@/lib/zendesk";
export const runtime="nodejs";
export async function POST(req:Request){
 if(!localAuthEnabled())return new NextResponse(null,{status:404});
 const c=config();
 if(req.headers.get("origin")!==c.origin)return new NextResponse(null,{status:403});
 const fail=(reason:string)=>new NextResponse(null,{status:303,headers:{Location:"/production/signin?error="+reason}});
 try{
 const {token,maxAge}=await tokenRequest({grant_type:"client_credentials",scope:c.scope});
 const user=await me(token);
 if(!user||user.suspended||user.role!=="admin")return fail("role");
 const r=NextResponse.redirect(c.origin+"/dashboard/overview",303);
 r.cookies.set(SESSION,seal({token,exp:Date.now()+maxAge*1000,mode:"local"}),{...sessionOptions,maxAge});return r;
 }catch(e){return fail(e instanceof ZendeskError?"local-"+e.status:"local-error");}
}
