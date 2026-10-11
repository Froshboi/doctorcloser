import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/src/components/providers";
import { SiteHeader } from "@/src/components/site-header";
import { SiteFooter } from "@/src/components/site-footer";

export const metadata: Metadata = {
  title: { default: "DoctorCloser", template: "%s | DoctorCloser" },
  description: "Book trusted healthcare appointments in Nigeria.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
