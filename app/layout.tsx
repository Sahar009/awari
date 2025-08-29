import type { Metadata } from "next";
import { Exo } from "next/font/google";
import "./globals.css";

const geistSans = Exo({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Awari",
  description: "Awari Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
       
      >
        {children}
      </body>
    </html>
  );
}
