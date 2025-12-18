import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TaskManagerProvider } from "@/context/TaskManagerContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <TaskManagerProvider>
              {children}
            </TaskManagerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
