import {NextResponse} from "next/server";
import {SESSION,STATE} from "@/lib/zendesk";
export async function POST(){const res=new NextResponse(null,{status:303,headers:{Location:"/production/signin"}});res.cookies.delete(SESSION);res.cookies.delete(STATE);return res;}
