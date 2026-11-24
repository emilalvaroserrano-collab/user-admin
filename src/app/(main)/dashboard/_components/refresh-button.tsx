"use client";
import {useRouter} from "next/navigation";import {useTransition} from "react";import {RefreshCw} from "lucide-react";import {Button} from "@/components/ui/button";
export function RefreshButton(){const router=useRouter();const [pending,start]=useTransition();return <Button variant="outline" disabled={pending} onClick={()=>start(()=>router.refresh())}><RefreshCw className={pending?"animate-spin":""}/>{pending?"Refreshing":"Refresh"}</Button>;}
