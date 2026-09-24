import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jayesh Devley — Building Ideas into Reality",
  description:
    "Jayesh Devley is a developer exploring ideas, building skills, and creating things that matter.",
  keywords: [
    "Jayesh",
    "JD",
    "Devley",
    "Jayesh Devley",
    "Jayesh Devley Portfolio",
    "Developer Portfolio",
    "Web Developer",
    "React Developer",
    "JavaScript Developer",
    "AI Developer",
    "CampusFlow",
  ],
  authors: [{ name: "Jayesh Devley" }],
  creator: "Jayesh Devley",
  metadataBase: new URL("https://jayeshdevley.in"),

  openGraph: {
    title: "Jayesh Devley — Building Ideas into Reality",
    description:
      "Exploring ideas, building skills, and creating things that matter.",
    url: "https://jayeshdevley.in",
    siteName: "Jayesh Devley",
    type: "website",
    locale: "en_IN",
    images: [
  {
    url: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Jayesh Devley — Building Ideas into Reality",
  },
],
  },

  twitter: {
    card: "summary_large_image",
    title: "Jayesh Devley — Building Ideas into Reality",
    description:
      "Exploring ideas, building skills, and creating things that matter.",
  },

  robots: {
    index: true,
    follow: true,
  },
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