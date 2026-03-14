import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CareSync — Modern EHR for Virtual-First Healthcare",
  description:
    "Streamline appointments, clinical documentation, and patient care. A modern alternative to Healthie for virtual-first healthcare teams.",
  keywords: [
    "EHR",
    "electronic health records",
    "telehealth",
    "virtual care",
    "healthcare",
  ],
  openGraph: {
    title: "CareSync — Modern EHR for Virtual-First Healthcare",
    description:
      "Streamline appointments, clinical documentation, and patient care. A modern alternative to Healthie for virtual-first healthcare teams.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(plusJakartaSans.variable, "min-h-screen bg-background font-sans text-foreground antialiased")}>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
