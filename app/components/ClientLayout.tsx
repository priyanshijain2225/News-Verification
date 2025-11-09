"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define routes where you DON'T want Navbar + Footer
  const hideLayout =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/news") ||
    pathname.startsWith("/login");

  return (
    <>

      <main className="flex-1">{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}
