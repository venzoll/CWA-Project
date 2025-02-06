import { NextResponse } from "next/server";
import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    // Parse the request body
    const { eventId, userId } = await req.json();

    // Log the received input
    console.log("Received eventId:", eventId, "Received userId:", userId);

    // Validate the input
    if (!eventId || !userId) {
      return NextResponse.json({
        success: false,
        message: "Invalid input: eventId and userId are required.",
      });
    }

    // Get the event document
    const eventDocRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventDocRef);

    // Check if the event exists
    if (!eventSnap.exists()) {
      console.error("Event not found for ID:", eventId);
      return NextResponse.json({ success: false, message: "Event not found." });
    }

    const eventData = eventSnap.data();
    console.log("Fetched event data:", eventData);

    // Check if seats are available
    if (eventData.seats <= 0) {
      console.error("No seats available for event:", eventId);
      return NextResponse.json({
        success: false,
        message: "No seats available for this event.",
      });
    }

    // Reduce the seat count
    await updateDoc(eventDocRef, { seats: eventData.seats - 1 });

    // Create a booking record
    await addDoc(collection(db, "bookings"), {
      eventId,
      userId,
      eventName: eventData.name, // Store the event name
      eventType: eventData.type, // Store the event type
      timestamp: serverTimestamp(), // Store to Firestore
    });

    console.log("Booking successful for eventId:", eventId, "userId:", userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in booking API:", error.message);
    return NextResponse.json({ success: false, message: error.message });
  }
}
