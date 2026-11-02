import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bean & Byte — Demo Storefront",
  description:
    "A small, friendly storefront used for demos. Coffee, cart math, and clean tests.",
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
