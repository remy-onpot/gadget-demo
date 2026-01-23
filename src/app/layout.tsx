import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NimdeShop",
  description: "The OS for African Commerce",
  icons: {
    icon: '/icon.png', // Points to public/icon.png
    shortcut: '/icon.png',
    apple: '/icon.png',
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
