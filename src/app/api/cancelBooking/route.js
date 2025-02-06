import { NextResponse } from "next/server";
import { doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export async function POST(req) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    // Get the booking document
    const bookingDocRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingDocRef);

    if (!bookingSnap.exists()) {
      return NextResponse.json({
        success: false,
        message: "Booking not found.",
      });
    }

    const bookingData = bookingSnap.data();

    // Restore the event seats
    const eventDocRef = doc(db, "events", bookingData.eventId);
    const eventSnap = await getDoc(eventDocRef);

    if (eventSnap.exists()) {
      const eventData = eventSnap.data();
      await updateDoc(eventDocRef, { seats: eventData.seats + 1 });
    }

    // Delete the booking document
    await deleteDoc(bookingDocRef);

    return NextResponse.json({
      success: true,
      message: "Booking canceled successfully.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
