import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import initializeHelia from '@/app/lib/helia';
import { verifiedFetch } from '@helia/verified-fetch'

export async function GET(req: NextRequest, { params }: any) {
  try {
    const helia = await initializeHelia();
    const c = await helia.libp2p.peerId;
    const resp = await verifiedFetch(`ipfs://${params.cid}`)
    const blob = await resp.blob();
    

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'image/png', // or the actual MIME type of the image
      },
    });
  } catch (e) {
    return NextResponse.json('cid not valid');
  }
}