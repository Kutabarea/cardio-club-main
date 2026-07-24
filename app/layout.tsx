import type { Metadata } from "next";

import Footer from "./components/Footer";
import Header from "./components/Header";

import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Cardio Club",
  description: "Образовательная платформа для кардиологов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Header />

        <div className="site-page-content">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}