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

export default initializeHelia;
