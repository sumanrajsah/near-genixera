'use server'
import { MongoClient, ServerApiVersion } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// Use the JWT key
import pinataSDK from '@pinata/sdk'
import { metaData, Posts } from '@/app/components/interface';
import { Readable } from 'stream';
import {create} from 'kubo-rpc-client'
import { unixfs } from '@helia/unixfs'
import { createLibp2p } from 'libp2p';
import { createHelia } from 'helia';
import { noise } from '@chainsafe/libp2p-noise';
import { tcp } from '@libp2p/tcp'
import { yamux } from '@chainsafe/libp2p-yamux';
import { bootstrap } from '@libp2p/bootstrap';
import { identify } from '@libp2p/identify';
import { multiaddr } from '@multiformats/multiaddr';
import { webTransport } from '@libp2p/webtransport'
import { webSockets } from '@libp2p/websockets'
import * as filters from '@libp2p/websockets/filters'



let helia:any = null;

async function initializeHelia() {
  if (helia) return helia;

  
const address = '/ip4/152.228.215.212/tcp/4001/p2p/12D3KooWP8kRYMdPjqb8XosXeZQsAdqjiHcHgQfSCamT3gxGquPW';

const libp2p = await createLibp2p({
  addresses: {
    listen: ['/ip4/127.0.0.1/tcp/0/ws']
    },
  transports: [tcp(),webSockets({filter: filters.all})],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  peerDiscovery: [bootstrap({
    list: [
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
      "/ip4/192.168.1.118/tcp/4001/p2p/12D3KooWGnKZRJ6NzxJEPMQFx8rNMqAy7L711RsQfxhCtARRFKrz"
    ]
  })],
  services: {
    identify: identify()
  }
});

const ma = multiaddr(address);

helia = await createHelia({ libp2p });
const c=await helia.libp2p.dial(ma);
console.log(helia.libp2p.peerId)
  return helia;
}



const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
let client: MongoClient

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
if (uri) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
} else {
  // Handle the case where uri is undefined
  console.error("URI is undefined");
}

export async function POST(req: NextRequest) {
  let h, i;
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const helia = await initializeHelia();
    const fs= unixfs(helia);
    const ipfs = create('/ip4/152.228.215.212/tcp/5001')
    const ipfs2 = create('/ip4/152.228.215.212/tcp/9095')
    // console.log(res)
    const postData = await req.json();
    //  console.log(postData)
    const post_time = Date.now();

    const address = req.cookies.get('wallet_address')?.value || '';
    await client.connect();
    const database = client.db("gensquare");
    const users = database.collection("users");
    const postsDb = database.collection("posts");
    const uwa = await users.findOne({ _id: postData.author });
    //  console.log(uwa)
    // generate post id

    const generatePostId = (userId: any) => {
      const timestamp = post_time; // Get current timestamp
      const postId = `${timestamp}`; // Combine user ID, timestamp, and random string
      return postId;
    };
    const post_ID: any = generatePostId(address);
    // console.log(post_ID)

    // text type post
    if (uwa) {
      if (postData.post_type === 'text') {
        const PostMetaData: metaData = {
          post_id: post_ID,
          author_address: `${postData.author}`,
          author_username: uwa.profile.username,
          post_type: `${postData.post_type}`,
          time: `${post_time}`,
          media: '',
          content: `${postData.post_content}`,
          app: 'genx'

        }
        const fileContent = JSON.stringify(PostMetaData);
        const encoder = new TextEncoder()
        // const resData = await pinata.pinJSONToIPFS(PostMetaData);
       const cid = await fs.addBytes(encoder.encode(fileContent))
       console.log(cid)
        // const resData= await ipfs.add(file,{pin:true})
        // await ipfs2.pin.add(resData.cid)
         await ipfs2.pin.add(cid)
         await ipfs.pin.add(cid)
        
        
        const query: Posts = { _id: post_ID, content_url: `https://ipfs.io/ipfs/${cid}`, media_url: '', time: post_time, post_type: `${postData.post_type}`, on_chain: false, author_address: `${postData.author}`, author_username: uwa.profile.username, tags: postData.post_tags, parent_post:'',like_list: [], reply_list: [], repost_list: [], view: [],visibility:true };
        h= query.content_url
        // check username already registered
        const postinfo = await postsDb.insertOne(query);
        
        
        
        const addPost = await users.updateOne(
          { _id: uwa._id },
          { $push: { "profile.post_id": post_ID } }
        );
        // console.log(addPost)
        
        
        
        if (postinfo) {
          // pinata.unpin(resData.IpfsHash);
          return NextResponse.json({ success: true, message: 'Successfully posted', postinfo,uri:h });
        }
      }

      //upload image on pinata

      const base64Data = postData.media_file;
      const dta = base64Data.split(',')[1];
      const binaryData = Buffer.from(dta, 'base64');

      const readableStreamForFile = new Readable();
      readableStreamForFile.push(binaryData);
      readableStreamForFile.push(null);
      const metaname = post_ID + '-' + Date.now();
      const options: any = {
        pinataMetadata: {
          name: metaname,
          keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
          }
        },
        pinataOptions: {
          cidVersion: 0
        }
      };

        // const resData = await pinata.pinJSONToIPFS(PostMetaData);
       const mediaCid = await fs.addByteStream(readableStreamForFile)
       console.log(mediaCid)
        // const resData= await ipfs.add(file,{pin:true})
        // await ipfs2.pin.add(resData.cid)
         await ipfs2.pin.add(mediaCid)
         await ipfs.pin.add(mediaCid)
      // console.log(MediaData.IpfsHash)

      // upload metadata of post to pinata

      const PostMetaData: metaData = {
        post_id: post_ID,
        author_address: `${postData.author}`,
        author_username: uwa.profile.username,
        post_type: `${postData.post_type}`,
        time: `${post_time}`,
        media: `https://ipfs.io/ipfs/${mediaCid}`,
        content: `${postData.post_content}`,
        app: 'genx'

      }

      const fileContent = JSON.stringify(PostMetaData);
      const encoder = new TextEncoder()
      // const resData = await pinata.pinJSONToIPFS(PostMetaData);
     const cid = await fs.addBytes(encoder.encode(fileContent))
     console.log(cid)
      // const resData= await ipfs.add(file,{pin:true})
      // await ipfs2.pin.add(resData.cid)
       await ipfs2.pin.add(cid)
       await ipfs.pin.add(cid)

      const query: Posts = { _id: post_ID, content_url: `https://ipfs.io/ipfs/${cid}`, author_address: `${postData.author}`, author_username: uwa.profile.username, media_url: `https://ipfs.io/ipfs/${mediaCid}`, time: post_time, post_type: `${postData.post_type}`, on_chain: false, parent_post:'', tags: postData.post_tags, like_list: [], reply_list: [], repost_list: [], view: [],visibility:true };

      // check username already registered
      const postinfo = await postsDb.insertOne(query);
      // console.log(postinfo);
      h= query.content_url


      const addPost = await users.updateOne(
        { _id: uwa._id },
        { $push: { "profile.post_id": post_ID } }
      );
      // console.log(addPost)
      if (postinfo) {
        // pinata.unpin(MediaData.IpfsHash)
        // pinata.unpin(resData.IpfsHash)
        return NextResponse.json({ success: true, message: 'Successfully posted', postinfo,uri:h });
      }
    }






  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: "error",error });
  }
  finally {
    // await client.close();
  }
  return NextResponse.json({ success: false, message: 'unsuccessful' });
}