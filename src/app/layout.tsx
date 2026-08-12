import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Tide Events Group — Business & Operations System",
  description: "Tide Events Group Scotland — commercial, event and incident operating platform",
  icons: {
    icon: "https://res.cloudinary.com/p8fhvvbp/image/upload/v1785770678/2_wktobe.png",
    shortcut: "https://res.cloudinary.com/p8fhvvbp/image/upload/v1785770678/2_wktobe.png",
    apple: "https://res.cloudinary.com/p8fhvvbp/image/upload/v1785770678/2_wktobe.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
