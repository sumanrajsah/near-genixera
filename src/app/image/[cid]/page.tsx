"use client"

import MediaFetcher from "@/app/components/mediafetcher";
import React, { useState } from "react";
import Image from "next/image";


export default function VideoApp({ params }:any) {
  const [MediaBlob, setMediaBlob] = useState<Blob | null>(null);

  return (
    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
      <MediaFetcher cid={params.cid} setMediaBlob={setMediaBlob} />
      {MediaBlob && 
      <Image src={URL.createObjectURL(MediaBlob)} height={500} width={500} alt="genx" style={{ position:'absolute',display: 'flex',justifyContent:'center',alignItems:'center', width: 'auto', height: 'auto',maxHeight:'95vh',maxWidth:'95vw',minWidth:'50vw',minHeight:'50vh' }}/>
      }
    </div>
  );
}