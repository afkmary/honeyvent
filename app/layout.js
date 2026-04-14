import "./globals.css";
import { AuthContextProvider } from "@/contexts/AuthContext";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "HONEYVENT",
  description: "Event planning app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}