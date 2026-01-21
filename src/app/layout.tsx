import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MarketFlow",
  description: "The OS for African Commerce",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
