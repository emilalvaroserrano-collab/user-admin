"use client";
import {useEffect} from "react";import {useRouter} from "next/navigation";
export function LiveRefresh(){const router=useRouter();useEffect(()=>{const id=setInterval(()=>{if(document.visibilityState==="visible"&&!document.querySelector("form:focus-within"))router.refresh();},30000);return()=>clearInterval(id);},[router]);return null;}
