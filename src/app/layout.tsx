import type { Metadata } from 'next';
import './globals.css';
import { ThemeToggle } from './ThemeToggle'; // Importamos el componente de cliente

export const metadata: Metadata = {
  // Título actualizado para el panel principal
  title: 'Herramientas Job - Panel Principal',
  description: 'App by Kzy', // Se mantiene tu descripción
  icons: {
    icon: '/images/status-1.png', // Se mantiene tu ícono
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    // Se mantiene tu lang="en"
    <html lang="en">
      <head>
        {/* Se mantienen tus links de fuentes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>

      {/* Clases fusionadas: Tus clases + las de layout + las de tema */}
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground">
        
        {/* Header añadido con el toggle de tema */}
        <header className="container mx-auto px-4 pt-4 flex justify-end">
          <ThemeToggle />
        </header>

        {/* Contenido principal de la página */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer añadido */}
        <footer className="w-full py-4 text-center text-sm text-muted-foreground">
          Angel Salguero &copy; {currentYear}
        </footer>
      </body>
    </html>
  );
}