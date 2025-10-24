import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Merge Excels from TB',
  description: 'App by Kzy',
  icons: {
    icon: '/images/status-1.png', // Ruta desde la carpeta 'public'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
