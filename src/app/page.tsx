import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Image, FolderPlus } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          Utilidades Job
        </h1>
        <p className="text-muted-foreground mt-2">
          Selecciona una acción para comenzar.
        </p>
      </div>

      {/* Grid para los botones grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

        {/* 1. Merge EXCEL TB (Botón funcional - Verde) */}
        <Link href="/merge-excel" passHref>
          <Button 
            variant="outline" 
            className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg 
                       border-green-500 text-green-700 hover:bg-green-50
                       dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
          >
            {/* El icono hereda el color del texto */}
            <FileText className="h-8 w-8 mb-2" />
            <span>Merge EXCEL TB</span>
          </Button>
        </Link>

        {/* 2. Move img TY RFID (Botón deshabilitado - Azul) */}
        <Button 
          variant="outline" 
          disabled 
          className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg opacity-50 cursor-not-allowed
                     border-blue-500 text-blue-700
                     dark:border-blue-400 dark:text-blue-400"
        >
          <Image className="h-8 w-8 mb-2" />
          <span>Move img TY RFID</span>
          <span className="text-sm font-normal text-muted-foreground mt-1">
            (Muy Pronto)
          </span>
        </Button>

        {/* 3. Move img 47TH (Botón deshabilitado - Índigo) */}
        <Button 
          variant="outline" 
          disabled 
          className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg opacity-50 cursor-not-allowed
                     border-indigo-500 text-indigo-700
                     dark:border-indigo-400 dark:text-indigo-400"
        >
          <Image className="h-8 w-8 mb-2" />
          <span>Move img 47TH</span>
          <span className="text-sm font-normal text-muted-foreground mt-1">
            (Muy Pronto)
          </span>
        </Button>

        {/* 4. Creating folders (Botón deshabilitado - Ámbar) */}
        <Button 
          variant="outline" 
          disabled 
          className="h-32 text-xl w-full flex flex-col items-center justify-center shadow-lg opacity-50 cursor-not-allowed
                     border-amber-500 text-amber-700
                     dark:border-amber-400 dark:text-amber-400"
        >
          <FolderPlus className="h-8 w-8 mb-2" />
          <span>Creating folders</span>
          <span className="text-sm font-normal text-muted-foreground mt-1">
            (Muy Pronto)
          </span>
        </Button>

      </div>
    </main>
  );
}