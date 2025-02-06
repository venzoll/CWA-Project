"use client";

import { useState } from "react";
import { useEvents } from "../context/EventsContext";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/map"), { ssr: false });

export default function Home() {
  const { events } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter((event) =>
    event.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Search Events</h2>
      <input
        type="text"
        placeholder="Search by type (e.g., social, coding, trip)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          marginBottom: "20px",
          padding: "10px",
          width: "100%",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      <h3>Event List</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredEvents.map((event, index) => (
          <li
            key={index}
            style={{
              marginBottom: "10px",
              padding: "10px",
              backgroundColor: "#f9f9f9",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <strong>{event.type}:</strong> {event.name} - {event.seats} seats
            available
          </li>
        ))}
      </ul>

      <h3>Event Map</h3>
      <Map events={filteredEvents} />
    </div>
  );
}
