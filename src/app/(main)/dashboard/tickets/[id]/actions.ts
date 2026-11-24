"use server";
import {revalidatePath} from "next/cache";import {redirect} from "next/navigation";import {requireStaff,zd} from "@/lib/zendesk";
export async function updateTicket(id:string,form:FormData){
 if(!/^\d+$/.test(id))throw new Error("Invalid ticket ID");
 const {token}=await requireStaff();const status=String(form.get("status")||"");const comment=String(form.get("comment")||"").trim();const updated=String(form.get("updated_at")||"");
 if(!["new","open","pending","hold","solved"].includes(status)||!updated||comment.length>10000)throw new Error("Invalid ticket update");
 const ticket={status,safe_update:true,updated_stamp:updated,...(comment?{comment:{body:comment,public:form.get("visibility")==="public"}}:{})};
 let result="saved";try{await zd(token,"/api/v2/tickets/"+id+".json",{method:"PUT",body:JSON.stringify({ticket})});}catch{result="failed";}
 revalidatePath("/dashboard/tickets/"+id);redirect("/dashboard/tickets/"+id+"?result="+result);
}
