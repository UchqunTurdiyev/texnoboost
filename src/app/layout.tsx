/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://texnoboost.vercel.app/"), // ⬅️ domeningizni yozing (yoki Vercel domen)
  title: {
    default: "TexnoBoost — hammasi oson!",
    template: "%s | TexnoBoost",
  },
  description:
    "Perfectum telefonlari bo‘yicha tez ro‘yxatdan o‘ting — operatorlar qisqa vaqt ichida bog‘lanadi va ulanish bo‘yicha yordam beradi.",
  applicationName: "TexnoBoost",
  keywords: [
    "TexnoBoost",
    "Perfectum",
    "telefon",
    "aloqa",
    "ro‘yxatdan o‘tish",
    "Samarqand",
  ],
  themeColor: "#FB923C", // och apelsin (orange)

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.PNG", type: "image/png", sizes: "32x32" },
      { url: "/logo.PNG", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/logo.PNG", sizes: "180x180" }],
  },

  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "/",
    siteName: "TexnoBoost",
    title: "TexnoBoost — hammasi oson!",
    description:
      "Perfectum telefonlari bo‘yicha tez ro‘yxatdan o‘ting. Operatorlar siz bilan bog‘lanadi va ulanishni yo‘lga qo‘yadi.",
    images: [
      // ✅ eng zo‘ri: 1200x630 rasm (og.png) bo‘lsin
      { url: "/og.png", width: 1200, height: 630, alt: "TexnoBoost" },
      // ✅ zahira: sizda bor logo
      { url: "/logo.PNG", width: 512, height: 512, alt: "TexnoBoost logo" },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TexnoBoost — hammasi oson!",
    description:
      "Perfectum telefonlari bo‘yicha tez ro‘yxatdan o‘ting. Operatorlar siz bilan bog‘lanadi.",
    images: ["/og.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const PIXEL_ID = "1982098556057244";
  return (
    <html lang="en">
      <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
            <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
