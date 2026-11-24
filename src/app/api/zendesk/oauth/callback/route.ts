import {NextRequest,NextResponse} from "next/server";
import {config,me,isStaff,seal,unseal,SESSION,STATE,sessionOptions,tokenRequest} from "@/lib/zendesk";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 const fail=(reason:string)=>{const r=new NextResponse(null,{status:303,headers:{Location:"/production/signin?error="+reason}});r.cookies.delete(STATE);return r;};
 try{
 const c=config();
 if(process.env.VERCEL && req.nextUrl.origin!==c.origin)return fail("state");
 const state=unseal<{state:string;verifier:string;exp:number}>(req.cookies.get(STATE)?.value);
 const code=req.nextUrl.searchParams.get("code");
 if(!code||!state||state.exp<Date.now()||state.state!==req.nextUrl.searchParams.get("state"))return fail("state");
 const {token,maxAge}=await tokenRequest({grant_type:"authorization_code",code,redirect_uri:c.callback,scope:c.scope,code_verifier:state.verifier});
 if(!isStaff(await me(token)))return fail("role");
 const res=NextResponse.redirect(c.origin+"/dashboard/overview");res.cookies.delete(STATE);res.cookies.set(SESSION,seal({token,exp:Date.now()+maxAge*1000,mode:"oauth"}),{...sessionOptions,maxAge});return res;
 }catch{return fail("oauth");}
}
