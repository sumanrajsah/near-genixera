import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import initializeHelia from '@/app/lib/helia';
import { verifiedFetch } from '@helia/verified-fetch'


export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    console.log(searchParams)
    const query = searchParams.get('cid');
    try{
        const helia = await initializeHelia();
        const c= await helia.libp2p.peerId;
        const resp = await verifiedFetch(`ipfs://${query}`)
        const cont= await resp.json()

        return NextResponse.json(cont);
    }catch(e){
    return NextResponse.json('cid not valid');
    }
  }

