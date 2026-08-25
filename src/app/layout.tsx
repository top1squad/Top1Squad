import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Tournament Arena",
  description: "BGMI and Free Fire Tournament Platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">

        <Navbar />

        {children}

        <Footer />

      </body>
    </html>
  );
}