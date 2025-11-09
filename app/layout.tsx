import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";


const montserrat = Montserrat({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
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
      <body className={`${montserrat.className} ${montserrat.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
