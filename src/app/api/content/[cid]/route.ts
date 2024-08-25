import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import initializeHelia from '@/app/lib/helia';
import { verifiedFetch } from '@helia/verified-fetch'


export async function GET(req: NextRequest,{params}:any) {
    try{
        const helia = await initializeHelia();
        const c= await helia.libp2p.peerId;
        const resp = await verifiedFetch(`ipfs://${params.cid}`)
        const cont= await resp.json()

        return NextResponse.json(cont);
    }catch(e){
    return NextResponse.json('cid not valid');
    }
  }

