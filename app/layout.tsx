import type { Metadata } from "next";
import { Exo } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";


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
      <body className={geistSans.variable}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
