import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TaskManagerProvider } from "@/context/TaskManagerContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gamified Task Manager",
  description: "A fun, colorful, and gamified task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>
        <ThemeProvider>
          <TaskManagerProvider>
            {children}
          </TaskManagerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

