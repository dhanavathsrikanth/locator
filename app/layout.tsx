import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth-provider";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:9000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "GeoBatch — Geospatial API & Coordinate Conversion Tools",
    template: "%s | GeoBatch",
  },
  description:
    "Free geospatial API and web tools — batch geocode addresses, convert coordinates between DD/DMS/UTM/MGRS, and find your current location. No signup required for the free tier.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "GeoBatch",
    type: "website",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 min-w-0 lg:ml-64">
                {children}
              </main>
            </div>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "WebSite",
                      name: "GeoBatch",
                      url: defaultUrl,
                      description:
                        "Batch geocoding, coordinate conversion, and geospatial API tools.",
                      potentialAction: {
                        "@type": "SearchAction",
                        target: `${defaultUrl}/search?q={search_term_string}`,
                        "query-input": "required name=search_term_string",
                      },
                    },
                    {
                      "@type": "Organization",
                      name: "GeoBatch",
                      url: defaultUrl,
                      logo: `${defaultUrl}/opengraph-image.png`,
                      description:
                        "Free geospatial API and web tools for batch geocoding, coordinate conversion, and location detection.",
                    },
                  ],
                }),
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
