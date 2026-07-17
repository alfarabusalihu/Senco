import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthBootstrapper } from "@/providers/AuthBootstrapper";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "senco Weekly Planner",
    template: "%s | senco",
  },
  description: "Weekly reports and team dashboard for senco teams",
  openGraph: {
    title: "senco Weekly Planner",
    description: "Weekly reports and team dashboard for senco teams",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans h-full", geist.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full`}
      >
        <QueryProvider>
          <AuthBootstrapper>
            {children}
            <Toaster position="top-right" />
          </AuthBootstrapper>
        </QueryProvider>
      </body>
    </html>
  );
}

