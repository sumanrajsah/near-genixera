import { verifiedFetch } from "@helia/verified-fetch";

function binarySearch(arr: string[], target: string): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const guess = arr[mid];

    if (guess === target) {
      return mid;
    } else if (guess < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

export async function fetchMedia(cid:any){

  try {
    const response = await verifiedFetch(`ipfs://${cid}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    const blob = await response.blob();
return blob;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}

export function findUsernameInLikeList(likeList:any, username:any) {
  if (!likeList) {
    return null; // or throw an error, depending on your requirements
  }
  const sortedList = [...likeList].sort();
  const index = binarySearch(sortedList, username);
  return index !== -1 ? username : null;
}

export function findUsernameInRepostList(repost_list:any, username: string) {
  if (!repost_list) {
    return null; // or throw an error, depending on your requirements
  }
  const sortedList = [...repost_list].sort();
  const index = binarySearch(sortedList, username);
  return index !== -1 ? username : null;
}

export const formatTime = (postTime: Date) => {
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - postTime.getTime();

  const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
  const yearDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));

  let displayText;
  if (hoursDifference >= 24) {
    const options = { month: 'short', day: 'numeric', year: yearDifference >= 1 ? 'numeric' : undefined } as Intl.DateTimeFormatOptions;
    displayText = postTime.toLocaleDateString(undefined, options);
  } else {
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const secondsDifference = Math.floor(timeDifference / 1000);

    if (hoursDifference >= 1) {
      displayText = hoursDifference + 'h';
    } else if (minutesDifference >= 1) {
      displayText = minutesDifference + 'm';
    } else {
      displayText = secondsDifference + 's';
    }
  }

  return displayText;
};