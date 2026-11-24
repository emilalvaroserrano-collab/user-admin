export type RecordRow={id?:number|string;[key:string]:unknown};
export type Resource={title:string;endpoint:string;key:string;columns:string[];description:string};
const r=(title:string,endpoint:string,key:string,columns:string[],description:string):Resource=>({title,endpoint,key,columns,description});
export function resources():Record<string,Resource>{
 const object=(title:string,key:string|undefined)=>r(title,key&&/^[a-z0-9_]+$/.test(key)?"/api/v2/custom_objects/"+key+"/records":"","custom_object_records",["id","name","external_id","custom_object_fields","updated_at"],"Records are read from the configured Zendesk custom object.");
 return {
 tickets:r("Tickets","/api/v2/tickets.json","tickets",["id","subject","status","priority","requester_id","assignee_id","updated_at"],"Live support queue and native Zendesk ticket IDs."),
 views:r("Views","/api/v2/views.json","views",["id","title","active","position","updated_at"],"Zendesk views and queue definitions."),
 customers:r("Customers","/api/v2/users.json?role=end-user","users",["id","name","email","organization_id","updated_at"],"End-user records from Zendesk."),
 organizations:r("Organizations","/api/v2/organizations.json","organizations",["id","name","domain_names","updated_at"],"Customer organizations in Zendesk."),
 orders:object("Orders",process.env.ZENDESK_ORDER_OBJECT_KEY),products:object("Products",process.env.ZENDESK_PRODUCT_OBJECT_KEY),
 objects:r("Custom objects","/api/v2/custom_objects","custom_objects",["key","title","title_pluralized","description","updated_at"],"Discover actual object keys and schemas."),
 staff:r("Staff","/api/v2/users.json?role[]=agent&role[]=admin","users",["id","name","email","role","suspended"],"Zendesk staff and native roles."),
 groups:r("Groups","/api/v2/groups.json","groups",["id","name","description","default","deleted"],"Zendesk support teams."),
 fields:r("Ticket fields","/api/v2/ticket_fields.json","ticket_fields",["id","title","type","required","active"],"System and custom ticket metadata."),
 forms:r("Ticket forms","/api/v2/ticket_forms.json","ticket_forms",["id","name","active","default","ticket_field_ids"],"Native Zendesk ticket forms."),
 triggers:r("Triggers","/api/v2/triggers.json","triggers",["id","title","active","position","updated_at"],"Zendesk-owned notification and business rules.")
 };
}
export function valueText(value:unknown):string{if(value===null||value===undefined)return "—";if(typeof value==="object")return JSON.stringify(value);return String(value);}
export function displayKey(key:string){return key.replaceAll("_"," ");}
