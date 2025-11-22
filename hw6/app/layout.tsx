import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Line Chatbot Dashboard",
  description: "Line Messaging API Chatbot Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

