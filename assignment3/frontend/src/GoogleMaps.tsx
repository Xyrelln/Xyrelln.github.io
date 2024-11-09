import { useEffect, useRef } from "react";

interface GoogleMapsProps {
  center: { lat: number, lng: number };
}

export const GoogleMaps: React.FC<GoogleMapsProps> = ({ center }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function initMap() {
      if (!ref.current) return;

      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
  
      const map = new Map(ref.current, {
          center: center,
          zoom: 16,
          mapId: '4504f8b37365c3d0',
      });
  
      const marker = new AdvancedMarkerElement({
          map,
          position: center,
      });
    }
    initMap();
  }, [ref]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "700px" }}
    />
  );
};