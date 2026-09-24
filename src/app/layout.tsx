import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jayesh Devley — Building Ideas into Reality",
  description: "Personal portfolio of Jayesh Devley.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
