import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import { getPartnerLinkForUser } from "@/db/queries";
import { Noto_Sans_Arabic } from "next/font/google";

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic-raw",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter-raw",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Waypoint — Premium car rental, made simple",
  description: "Book cars from trusted local rental companies across Pakistan",

  // Prevent iOS Safari from auto-linking phone numbers
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
const session = await auth();

const partnerLink = session?.user?.id ? await getPartnerLinkForUser(session.user.id) : null;


  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-canvas text-slate-800">
        <Providers>
          <Nav partnerRole={partnerLink?.role ?? null} />
          {children}
        </Providers>
        <Footer />
      </body>
    </html>
  );
}