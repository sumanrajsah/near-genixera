import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
const path = request.nextUrl.pathname;

  const isPublicPath = path ==='/'|| path ==='/Signup';
  const token = request.cookies.get('LoginHash')?.value||'';
  const address = request.cookies.get('wallet_address')?.value||'';
  if(isPublicPath && token && address ){

    return NextResponse.redirect(new URL('/home', request.url))
  }
  if(!isPublicPath && (!token || !address ))
    {
      return NextResponse.redirect(new URL('/', request.url))
    }
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher:[
    '/',
    '/Signup',
    '/profile',
    '/home',
    '/explore',
    '/marketplace',
    '/profile/:path*'
  ],
}