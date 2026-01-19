import "./globals.css";
import Template from "../components/layout/Template";
import SplashScreen from "../components/ui/SplashScreen";
import { Indie_Flower } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const indieFlower = Indie_Flower({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-indie-flower",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://ugureliweb.vercel.app"),
  title: "Uğur Uğureli",
  description: "Uğur Uğureli Resmi Web Sitesi. Müzik, konserler.",
  keywords: "Uğur Uğureli, Müzik, Sanatçı, Albüm, Konser, Adana, Osmaniye, Kadirli, Hatay, Gaziantep, Ben Hala Sendeyim",
  openGraph: {
    title: "Uğur Uğureli",
    description: "Uğur Uğureli Resmi Web Sitesi. Müzik, konserler.",
    siteName: "Uğur Uğureli",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/main.webp",
        width: 1200,
        height: 630,
        alt: "Uğur Uğureli",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
      </head>
      <body className={indieFlower.variable}>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="3f9973e5-5436-46aa-adfe-2714073c2f8a"
          strategy="afterInteractive"
        />
        <SplashScreen />
        <Template>{children}</Template>
        <Analytics />
      </body>
    </html>
  );
}
