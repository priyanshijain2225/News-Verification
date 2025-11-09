import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "TruthLens — Real-time Verification",
  description: "AI-powered real-time verification for the modern information age.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
