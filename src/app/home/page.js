"use client";

import { useState, useEffect } from "react";
import { useEvents } from "../context/EventsContext";
import dynamic from "next/dynamic";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { setCookie, getCookie, destroyCookie } from "nookies";
import { updateDoc, deleteDoc } from "firebase/firestore";

const Map = dynamic(() => import("../components/map"), { ssr: false });

export default function Home() {
  const { events, setEvents } = useEvents();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingHistory, setBookingHistory] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [newEventType, setNewEventType] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [newEventSeats, setNewEventSeats] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState(null);

  useEffect(() => {
    fetchEventsFromAPI();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const usersCollection = collection(db, "users");
      const userSnapshot = await getDocs(usersCollection);
      const userData = userSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .find((user) => user.uid === userCredential.user.uid);

      if (userData) {
        alert(`Logged in as ${userData.role}: ${userCredential.user.email}`);
        setIsLoggedIn(true);
        setCurrentUser({ ...userCredential.user, role: userData.role });

        fetchBookingHistory();
      } else {
        alert("User data not found in Firestore.");
      }
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername("");
    setPassword("");
  };

  const registerUser = async (email, password, role = "user") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email,
        role,
      });

      alert(`Registered successfully as ${role}: ${userCredential.user.email}`);
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  const bookEvent = async (index) => {
    const event = events[index];

    if (!currentUser) {
      alert("You must be logged in to book an event.");
      return;
    }

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          userId: currentUser.uid || currentUser.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedEvents = [...events];
        updatedEvents[index].seats -= 1;
        setEvents(updatedEvents);

        fetchBookingHistory();

        alert(`Successfully booked: ${event.name}`);
      } else {
        alert(`Failed to book event: ${data.message}`);
      }
    } catch (error) {
      alert(`Error booking event: ${error.message}`);
    }
  };

  const addEventToFirestore = async () => {
    if (!newEventType || !newEventName || newEventSeats <= 0) {
      alert("Please enter valid event details.");
      return;
    }

    try {
      const newEvent = {
        type: newEventType,
        name: newEventName,
        seats: parseInt(newEventSeats, 10),
        coords: [51.505 + Math.random() * 0.01, -0.09 + Math.random() * 0.01],
      };

      const docRef = await addDoc(collection(db, "events"), newEvent);

      setEvents((prevEvents) => [
        ...prevEvents,
        { id: docRef.id, ...newEvent },
      ]);

      alert("Event added successfully!");
      setNewEventType("");
      setNewEventName("");
      setNewEventSeats(0);
    } catch (error) {
      alert(`Failed to add event: ${error.message}`);
    }
  };

  const fetchEventsFromAPI = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      } else {
        alert(`Failed to fetch events: ${data.message}`);
      }
    } catch (error) {
      alert(`Error fetching events: ${error.message}`);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      if (!currentUser) {
        alert("You must be logged in to view your booking history.");
        return;
      }

      const response = await fetch(
        `/api/bookings?userId=${currentUser.uid || currentUser.email}`
      );
      const data = await response.json();

      if (data.success) {
        setBookingHistory(data.bookings);
      } else {
        alert(`Failed to fetch booking history: ${data.message}`);
      }
    } catch (error) {
      alert(`Error fetching booking history: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchBookingHistory();
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    fetchEventsFromAPI();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cancelBooking = async (bookingId, eventId) => {
    try {
      const response = await fetch("/api/cancelBooking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId, eventId }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Booking canceled successfully!");

        fetchBookingHistory();
        fetchEventsFromAPI();
      } else {
        alert(`Failed to cancel booking: ${data.message}`);
      }
    } catch (error) {
      alert(`Error canceling booking: ${error.message}`);
    }
  };

  const editEventInFirestore = async (eventId) => {
    if (!newEventType || !newEventName || newEventSeats <= 0) {
      alert("Please enter valid event details.");
      return;
    }

    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        type: newEventType,
        name: newEventName,
        seats: parseInt(newEventSeats, 10),
      });

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                type: newEventType,
                name: newEventName,
                seats: newEventSeats,
              }
            : event
        )
      );

      alert("Event updated successfully!");
      setEditingIndex(null);
      setNewEventType("");
      setNewEventName("");
      setNewEventSeats("");
    } catch (error) {
      alert(`Failed to update event: ${error.message}`);
    }
  };

  const cancelEventInFirestore = async (eventId) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await deleteDoc(eventRef);

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );

      alert("Event canceled successfully!");
    } catch (error) {
      alert(`Failed to cancel event: ${error.message}`);
    }
  };

  const editEvent = (index, event) => {
    setEditingIndex(index);
    setNewEventType(event.type);
    setNewEventName(event.name);
    setNewEventSeats(event.seats);
  };

  const saveEditedEvent = async () => {
    if (editingIndex === null) return;

    const eventToUpdate = events[editingIndex];
    const updatedEvent = {
      type: newEventType,
      name: newEventName,
      seats: parseInt(newEventSeats, 10),
    };

    try {
      const eventRef = doc(db, "events", eventToUpdate.id);
      await updateDoc(eventRef, updatedEvent);

      setEvents((prevEvents) =>
        prevEvents.map((event, idx) =>
          idx === editingIndex ? { ...event, ...updatedEvent } : event
        )
      );

      alert("Event updated successfully!");
      resetEventForm();
    } catch (error) {
      alert(`Failed to update event: ${error.message}`);
    }
  };

  const cancelEvent = async (index, eventId) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await deleteDoc(eventRef);

      setEvents((prevEvents) => prevEvents.filter((_, idx) => idx !== index));

      alert("Event canceled successfully!");
    } catch (error) {
      alert(`Failed to cancel event: ${error.message}`);
    }
  };

  const resetEventForm = () => {
    setEditingIndex(null);
    setNewEventType("");
    setNewEventName("");
    setNewEventSeats("");
  };

  const handleMarkerClick = (index, event) => {
    setSelectedEventForBooking(event);
  };

  return (
    <div>
      <header>
        <h1>Event Finder</h1>
        {isLoggedIn && (
          <button onClick={logout} style={{ float: "right" }}>
            Logout
          </button>
        )}
      </header>

      {!isLoggedIn ? (
        <div>
          <h2>{isRegistering ? "Register" : "Login"}</h2>

          <input
            type="email"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isRegistering ? (
            <button onClick={() => registerUser(username, password)}>
              Register
            </button>
          ) : (
            <button onClick={() => loginUser(username, password)}>Login</button>
          )}

          <button
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ marginLeft: "10px" }}
          >
            {isRegistering ? "Back to Login" : "Switch to Register"}
          </button>
        </div>
      ) : (
        <div>
          <h2>Search Events</h2>
          <input
            type="text"
            placeholder="Search by type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ul>
            {filteredEvents.map((event, index) => (
              <li key={event.id}>
                {event.type}: {event.name} - {event.seats} seats available
                {currentUser.role === "user" && (
                  <button onClick={() => bookEvent(index)}>Book</button>
                )}
              </li>
            ))}
          </ul>

          {currentUser.role === "admin" && (
            <div>
              <h2>Admin Panel</h2>

              {/* Form to Add or Edit Event */}
              <div>
                <input
                  placeholder="Event Type"
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  style={{ margin: "5px", padding: "5px", width: "200px" }}
                />
                <input
                  placeholder="Event Name"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  style={{ margin: "5px", padding: "5px", width: "200px" }}
                />
                <input
                  type="number"
                  placeholder="Seats"
                  value={newEventSeats}
                  onChange={(e) =>
                    setNewEventSeats(parseInt(e.target.value, 10) || 0)
                  }
                  style={{ margin: "5px", padding: "5px", width: "200px" }}
                />
                <button
                  onClick={
                    editingIndex === null
                      ? addEventToFirestore
                      : () => saveEditedEvent()
                  }
                  style={{
                    padding: "5px 15px",
                    backgroundColor:
                      editingIndex === null ? "#28a745" : "#007bff",
                    color: "white",
                    border: "none",
                  }}
                >
                  {editingIndex === null ? "Add Event" : "Save Changes"}
                </button>
              </div>

              {/* Display Events List */}
              <h3>All Events</h3>
              <ul>
                {events.map((event, index) => (
                  <li
                    key={event.id}
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      backgroundColor: "#f9f9f9",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                    }}
                  >
                    <strong>{event.type}:</strong> {event.name} - {event.seats}{" "}
                    seats
                    <button
                      onClick={() => editEvent(index, event)}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#ffc107",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => cancelEvent(index, event.id)}
                      style={{
                        marginLeft: "10px",
                        padding: "5px 10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2>Booking History</h2>
          <ul>
            {bookingHistory.map((booking, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  background: "#fff",
                  marginBottom: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                <div
                  onClick={() => setSelectedBooking(booking)}
                  style={{ flex: 1 }}
                >
                  {booking.eventName ? booking.eventName : "Unknown Event"}{" "}
                  (Booked on:{" "}
                  {booking.timestamp
                    ? new Date(booking.timestamp).toLocaleString()
                    : "Invalid Date"}
                  )
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelBooking(booking.id, booking.eventId);
                  }}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>

          {selectedBooking && (
            <div className="modal">
              <div className="modal-content">
                <h3>Booking Details</h3>
                <p>
                  <strong>Event Name:</strong>{" "}
                  {selectedBooking.eventName || "Unknown"}
                </p>
                <p>
                  <strong>Event Type:</strong>{" "}
                  {selectedBooking.eventType || "Unknown"}
                </p>
                <p>
                  <strong>Booked On:</strong>{" "}
                  {selectedBooking.timestamp
                    ? selectedBooking.timestamp.toLocaleString()
                    : "Invalid Date"}
                </p>
                <button onClick={() => setSelectedBooking(null)}>Close</button>
              </div>
            </div>
          )}

          <h2>Event Locations</h2>
          <div className="map-container">
            <Map events={filteredEvents} onMarkerClick={handleMarkerClick} />
          </div>

          {selectedEventForBooking && (
            <div className="modal">
              <div className="modal-content">
                <h3>Book Event</h3>
                <p>
                  <strong>Event Name:</strong> {selectedEventForBooking.name}
                </p>
                <p>
                  <strong>Seats Available:</strong>{" "}
                  {selectedEventForBooking.seats}
                </p>
                <button
                  onClick={() => {
                    const eventIndex = events.findIndex(
                      (e) => e.id === selectedEventForBooking.id
                    );
                    bookEvent(eventIndex);
                    setSelectedEventForBooking(null);
                  }}
                >
                  Book
                </button>
                <button onClick={() => setSelectedEventForBooking(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
