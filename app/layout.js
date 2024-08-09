import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import SessionProvider from "./components/SessionProvider"
import NavMenu from "./components/NavMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "React Helper",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) 
{
  const session = await getServerSession();
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
        <main className="mx-auto max-w-5xl text-2xl flex gap-2">
       
        {children}
        </main>
        </SessionProvider>
      </body>
    </html>
  );
}
