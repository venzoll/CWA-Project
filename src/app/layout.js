import "./styles/globals.css";
import Link from "next/link";
import { EventsProvider } from "./context/EventsContext";

export const metadata = {
  title: "Event Finder",
  description: "Find and book events easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <EventsProvider>
          <header
            style={{
              padding: "10px 20px",
              backgroundColor: "#f8f9fa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1 style={{ margin: 0 }}>Event Finder</h1>
            <nav>
              <Link
                href="/home"
                style={{
                  marginRight: "20px",
                  textDecoration: "none",
                  color: "#007bff",
                }}
              >
                Home
              </Link>
            </nav>
          </header>
          <main style={{ margin: "20px" }}>{children}</main>
        </EventsProvider>
      </body>
    </html>
  );
}
