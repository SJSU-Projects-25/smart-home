import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Home Cloud Platform",
  description: "Smart Home Cloud Platform Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
