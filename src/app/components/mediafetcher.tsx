"use client"
import { verifiedFetch } from '@helia/verified-fetch';
import { useEffect, useMemo } from 'react';

export default function MediaFetcher({ setMediaBlob, cid }:any) {
  
  const fetchVideo = useMemo(() => {
    
    async function fetchVideoInner() {
      try {
        const response = await verifiedFetch(`ipfs://${cid}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        const blob = await response.blob();
        setMediaBlob(blob); // Pass the blob up to the parent component
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    }

    return fetchVideoInner;
  }, [cid, setMediaBlob]);

  useEffect(() => {
    if(!cid){return }
    fetchVideo();
  }, [fetchVideo,cid]);

  return null; // This component doesn’t render anything
}