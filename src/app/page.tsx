import { Metadata } from "next";
import LandingPageClient from "@/components/landing/LandingPageClient";

export const metadata: Metadata = {
  title: "NimdeShop | The Commerce Engine",
  description: "Create a professional store in seconds. No payment gateways, no fees, just closed deals in your DMs.",
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://nimdeshop.com",
    title: "NimdeShop | The Commerce Engine",
    description: "Turn your WhatsApp into a checkout machine.",
    siteName: "NimdeShop",
  },
};

export default function Page() {
  return <LandingPageClient />;
}