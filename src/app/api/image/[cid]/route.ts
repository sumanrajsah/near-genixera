import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import initializeHelia from '@/app/lib/helia';
import { verifiedFetch } from '@helia/verified-fetch'
import axios from 'axios';

export async function GET(req: NextRequest, { params }: any) {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${params.cid}`, {
      responseType: 'blob', // Important for binary data
    });
    

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'image/png', // or the actual MIME type of the image
      },
    });
  } catch (e) {
    return NextResponse.json('cid not valid');
  }
}