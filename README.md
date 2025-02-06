# Event Finder

## Overview

Event Finder is a web-based application that allows users to discover, book, and manage events. It features an interactive map, real-time booking updates, and role-based access for administrators and users. The app ensures a seamless event discovery and management experience.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Event Discovery**: Search for different types of events using keywords.
- **Seat Booking**: Users can book available seats for events in real-time.
- **Role-Based Access**: Admins can create, edit, and delete events, while users can book and manage their bookings.
- **Interactive Map**: Events are displayed on a map for easy location-based discovery.
- **Authentication**: Secure user registration and login with Firebase Authentication.
- **Real-Time Updates**: Event availability updates dynamically with Firebase Firestore.

## Technologies Used

- **Next.js** - React framework for server-side rendering and performance optimization.
- **Firebase** - Used for authentication, Firestore database, and hosting.
- **Leaflet.js** - Interactive map visualization for event locations.
- **React Context API** - State management for event data.

### Steps to Run Locally

1. Clone the repository:

2. Navigate to the project directory:

3. Install dependencies:
   Dependencies Installed:
   • Next.js: npm install next react react-dom
   • Firebase: npm install firebase
   • Leaflet.js: npm install leaflet react-leaflet
   • nookies (for cookies management): npm install nookies
   But for simplicity, npm install is enough since it will install everything automatically from package.json.

4. Set up Firebase:

- Create a Firebase project.
- Add Firebase config in `firebase.js`.
- Enable Firestore and Authentication.

5. Run the development server: npm run dev

6. Open the app in your browser at `http://localhost:3000`.

## Admin & User Credentials (For Testing)

- **Admin Credentials**:
- Email: `admin@gmail.com`
- Password: `adminpass`
- **User Credentials**:
- Email: `user@gmail.com`
- Password: `userpass`

## API Endpoints

- `GET /api/events` - Fetch all events.
- `POST /api/book` - Book an event.
- `GET /api/bookings?userId=<userId>` - Fetch user’s booking history.
- `POST /api/cancelBooking` - Cancel a booking.

## Testing

- **Manual Testing**: Events were booked and cancelled to ensure real-time updates.
- **Security Testing**: Firebase rules were configured to prevent unauthorized access.
- **Performance Testing**: The app was tested for responsiveness and Firestore efficiency.

## Future Improvements

- **Payment Integration**: Allow paid event bookings.
- **Event Notifications**: Email reminders for booked events. -**Styling**: A better CSS implementation and compliant UX principles design.
