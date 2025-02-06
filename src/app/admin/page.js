"use client";

import { useState } from "react";
import { useEvents } from "../context/EventsContext";

export default function Admin() {
  const { events, setEvents } = useEvents();
  const [newEventType, setNewEventType] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [newEventSeats, setNewEventSeats] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);

  const addEvent = () => {
    if (!newEventType || !newEventName || newEventSeats <= 0) {
      alert("Please enter valid event details.");
      return;
    }

    const newEvent = {
      type: newEventType,
      name: newEventName,
      seats: newEventSeats,
      coords: [51.505 + Math.random() * 0.01, -0.09 + Math.random() * 0.01],
    };

    setEvents([...events, newEvent]);
    alert("Event added successfully!");
  };

  const editEvent = (index) => {
    setEditingIndex(index);
    const event = events[index];
    setNewEventType(event.type);
    setNewEventName(event.name);
    setNewEventSeats(event.seats);
  };

  const saveEditedEvent = () => {
    const updatedEvents = [...events];
    updatedEvents[editingIndex] = {
      ...updatedEvents[editingIndex],
      type: newEventType,
      name: newEventName,
      seats: newEventSeats,
    };
    setEvents(updatedEvents);
    alert("Event updated successfully!");
    setEditingIndex(null);
  };

  const cancelEvent = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    setEvents(updatedEvents);
    alert("Event canceled successfully!");
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Add New Event</h2>
      <input
        placeholder="Event Type"
        value={newEventType}
        onChange={(e) => setNewEventType(e.target.value)}
      />
      <input
        placeholder="Event Name"
        value={newEventName}
        onChange={(e) => setNewEventName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Seats"
        value={newEventSeats}
        onChange={(e) => setNewEventSeats(parseInt(e.target.value))}
      />
      {editingIndex === null ? (
        <button onClick={addEvent}>Add Event</button>
      ) : (
        <button onClick={saveEditedEvent}>Save Changes</button>
      )}

      <h2>All Events</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            {event.type}: {event.name} - {event.seats} seats
            <button onClick={() => editEvent(index)}>Edit</button>
            <button onClick={() => cancelEvent(index)}>Cancel</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
