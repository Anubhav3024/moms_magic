import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Mom's Magic | Homemade Taste, Magical Experience",
  description:
    "Experience premium homemade food with Mom's Magic. Elegant, homely, and modern restaurant in India.",
  icons: {
    icon: "/moms-magic-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${playfair.variable} font-sans`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
