import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon paths for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function Map({ events, onMarkerClick }) {
  useEffect(() => {
    // Initialize the map
    const map = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Add markers for events
    events.forEach((event, index) => {
      const marker = L.marker(event.coords).addTo(map);

      // Attach click event to marker
      marker.on("click", () => {
        if (onMarkerClick) {
          onMarkerClick(index, event); // Pass the event index and event data
        }
      });
    });

    return () => {
      map.remove(); // Clean up the map on component 
    };
  }, [events, onMarkerClick]);

  return (
    <div
      id="map"
      style={{ height: "400px", width: "100%", marginTop: "20px" }}
    ></div>
  );
}
