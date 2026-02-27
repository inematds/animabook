import type { Metadata } from "next";
import { Fredoka, Bangers, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Animabook",
  description: "Livros animados em quadrinhos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${fredoka.variable} ${bangers.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
