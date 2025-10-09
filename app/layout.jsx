import "./globals.css";
import { AuthProvider } from "../contexts/auth";

export const metadata = {
  title: "E-Clinic",
  description: "Clinic management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
