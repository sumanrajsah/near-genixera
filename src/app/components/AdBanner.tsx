import { useEffect } from 'react';

// Extend the Window interface to declare adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any;
  }
}

const AdBanner = (props:any) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle adbanner-customize"
      style={{display:'inline-block',width:'250px',height:'90px'
      }}
      data-ad-slot="9053418070"
      data-ad-client={process.env.NEXT_PUBLIC_GA_ID}
      {...props}
    />
  );
};

export default AdBanner;
