import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stag Points - Track Your Stag Do Challenges",
  description: "Real-time points tracking app for stag do challenges. Create games, add challenges, and compete with your mates. No login required!",
  keywords: ["stag do", "bachelor party", "points tracker", "challenges", "games"],
  authors: [{ name: "Stag Points" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#3B82F6",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
