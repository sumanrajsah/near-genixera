"use client";
import { useEffect, useMemo } from 'react';
import axios from 'axios';

export default function MediaFetcher({ setMediaBlob, cid }: any) {
  const fetchVideo = useMemo(() => {
    async function fetchVideoInner() {
      try {
        // Use axios to fetch the video as a blob
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_IPFS_URL}/${cid}`, {
          responseType: 'blob', // Important for binary data
        });

        // Set the fetched blob data to the parent component
        setMediaBlob(response.data); // In axios, the blob is in response.data
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    }

    return fetchVideoInner;
  }, [cid, setMediaBlob]);

  useEffect(() => {
    if (!cid) return;
    fetchVideo();
  }, [fetchVideo, cid]);

  return null; // This component doesn’t render anything
}
