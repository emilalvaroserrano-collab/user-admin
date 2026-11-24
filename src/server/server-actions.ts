"use server";
import {cookies} from "next/headers";
import {getPreferencePersistence,PREFERENCE_REGISTRY,type PreferenceKey,type PreferenceValueMap,parsePreference} from "@/lib/preferences/preferences-config";
export async function setValueToCookie(key:string,value:string,options:{path?:string;maxAge?:number}={}):Promise<void>{
 if(!Object.hasOwn(PREFERENCE_REGISTRY,key))throw new Error("Invalid preference");
 const pref=key as PreferenceKey;
 if(getPreferencePersistence(pref)!=="server-cookie"||parsePreference(pref,value)!==value)throw new Error("Invalid preference value");
 (await cookies()).set(key,value,{path:"/",maxAge:options.maxAge??604800,sameSite:"lax"});
}
export async function getPreference<K extends PreferenceKey>(key:K):Promise<PreferenceValueMap[K]>{
 if(!Object.hasOwn(PREFERENCE_REGISTRY,key))throw new Error("Invalid preference");
 const definition=PREFERENCE_REGISTRY[key];const persistence=getPreferencePersistence(key);
 if(persistence!=="client-cookie"&&persistence!=="server-cookie")return definition.defaultValue as PreferenceValueMap[K];
 return parsePreference(key,(await cookies()).get(key)?.value.trim());
}
