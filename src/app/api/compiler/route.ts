import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import initializeHelia from '@/app/lib/helia';
import { verifiedFetch } from '@helia/verified-fetch'
import solc from 'solc';
import { readFileSync } from 'fs';


export async function POST(req: NextRequest) {
  const data = await req.json()
  console.log(data.contractCode)
    try{
        const input = {
            language: 'Solidity',
            sources: {
              'MyContract.sol': {
                content: data.contractCode,
              },
              
            },
            settings: {
              outputSelection: {
                '*': {
                  '*': ['*'],
                },
              },
            },
          };
        
          const output = JSON.parse(solc.compile(JSON.stringify(input)));

        return NextResponse.json(output);
    }catch(e){
    return NextResponse.json('cid not valid');
    }
  }

