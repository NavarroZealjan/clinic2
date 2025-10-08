export const metadata = {
  title: 'Clinic System',
  description: 'Clinic Appointment Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
