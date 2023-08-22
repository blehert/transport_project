import { useRef } from 'react';

const Iframe = () => {

  const iframeRef = useRef(null);

  return (
    <iframe
      title="map"
      ref={iframeRef}
      src="map.html"
      loading="lazy"
      className="iframe"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
};

export default Iframe;
