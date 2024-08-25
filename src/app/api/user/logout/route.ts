import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const a = cookies().set('wallet_address',' ',{ expires: 0 });
const o = cookies().set('LoginHash','',{ expires: 0 });
if(a && o){
    return NextResponse.json({ success:true,logout:"Logout Successful"});
}
      return NextResponse.json({ success:false,logout:"unsuccessful"});
  }