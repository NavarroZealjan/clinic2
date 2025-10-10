import "./globals.css"

export const metadata = {
  title: "E-Clinic Dashboard",
  description: "Medical clinic management dashboard",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
