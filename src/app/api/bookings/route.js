import { NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Validate userId
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User ID is required to fetch bookings.",
      });
    }

    // Query the bookings collection for the provided userId
    const bookingsRef = collection(db, "bookings");
    const bookingsQuery = query(bookingsRef, where("userId", "==", userId));
    const snapshot = await getDocs(bookingsQuery);

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        bookings: [],
        message: "No bookings found for this user.",
      });
    }

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp ? data.timestamp.toDate() : null, // Convert Firestore time to Date
      };
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Error fetching bookings: ${error.message}` },
      { status: 500 }
    );
  }
}
