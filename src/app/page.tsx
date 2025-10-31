"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileText, Loader2, X, AlertTriangle, Sun, Moon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define a type for the merged data for better type safety
type ExcelRow = { [key: string]: any };

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedData, setMergedData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [fileName, setFileName] = useState('Order_Form_Output'); // <-- ELIMINADO
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);

      setFiles(prevFiles => {
        const existingFileKeys = new Set(
          prevFiles.map(f => `${f.name}-${f.size}-${f.lastModified}`)
        );
        const uniqueNewFiles = newFiles.filter(f => {
          const fileKey = `${f.name}-${f.size}-${f.lastModified}`;
          return !existingFileKeys.has(fileKey);
        });
        return [...prevFiles, ...uniqueNewFiles];
      });

      setMergedData([]);
      setHeaders([]);
      setError(null);
    }
  };
  
  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  // --- NUEVA FUNCIÓN ---
  // Lógica de descarga movida a su propia función
  const downloadFile = (data: ExcelRow[], dataHeaders: string[]) => {
    if (data.length === 0) {
      setError("No data available to download.");
      return;
    }
    try {
      const worksheet = XLSX.utils.json_to_sheet(data, { header: dataHeaders });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'MergedData');
      // Nombre de archivo fijo como solicitaste
      XLSX.writeFile(workbook, `Merge_files.xlsx`);
    } catch (e) {
      console.error(e);
      setError("An error occurred while creating the download file.");
    }
  };
  
  const processFiles = async () => {
    if (files.length === 0) {
      setError("Please upload at least one Excel file.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    let allData: ExcelRow[] = [];
    let firstFileHeaders: string[] = [];

    try {
      // Process the first file to get the headers
      const firstFile = files[0];
      const firstFileData = await firstFile.arrayBuffer();
      const firstWorkbook = XLSX.read(firstFileData);
      const firstSheetName = firstWorkbook.SheetNames[0];
      const firstWorksheet = firstWorkbook.Sheets[firstSheetName];
      const firstJsonData = XLSX.utils.sheet_to_json<ExcelRow>(firstWorksheet, { header: 1, defval: "" });
      
      if (firstJsonData.length > 0) {
        firstFileHeaders = (firstJsonData[0] as string[]).map(String);
      } else {
        throw new Error("The first Excel file is empty or does not contain headers.");
      }
      setHeaders(firstFileHeaders);

      // Process all files
      for (const file of files) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { defval: "" });
        
        allData = allData.concat(jsonData);
      }
      
      // Normalize data to match the headers of the first file
      const normalizedData = allData.map(row => {
        const newRow: ExcelRow = {};
        for (const header of firstFileHeaders) {
          newRow[header] = row[header] ?? "";
        }
        return newRow;
      });

      setMergedData(normalizedData);

      // --- CAMBIO ---
      // Llamar a la descarga automáticamente después de procesar
      if (normalizedData.length > 0) {
        downloadFile(normalizedData, firstFileHeaders);
      } else {
        setError("No data was found to merge.");
      }

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while processing the files. Please ensure they are valid Excel files.");
      setMergedData([]);
      setHeaders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ELIMINADO ---
  // La función handleDownload ya no es necesaria
  // const handleDownload = () => { ... };
  
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="container mx-auto px-4 pt-4 flex justify-end">
        <div className="flex items-center space-x-2">
          <Sun className="h-[1.2rem] w-[1.2rem]" />
          <Switch
            id="theme-switch"
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
          <Moon className="h-[1.2rem] w-[1.2rem]" />
          <Label htmlFor="theme-switch" className="sr-only">Toggle theme</Label>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">TB RFID</h1>
          <p className="text-muted-foreground mt-2">Merge your Excel files from TB database into a single file with ease.</p>
        </div>

        {/* --- CAMBIO --- El bloque de error ahora está aquí arriba */}
        <div className="max-w-7xl mx-auto mb-4 lg:max-w-2xl">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* --- CAMBIO --- La cuadrícula ahora es de 1 columna y centrada */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start max-w-7xl mx-auto">
          
          {/* --- CAMBIO --- Añadidas clases para centrar la tarjeta en pantallas grandes */}
          <Card className="w-full shadow-lg lg:max-w-2xl lg:mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-6 w-6"/>
                1. Upload & Merge
              </CardTitle>
              <CardDescription>Select the Excel files (.xlsx, .xls, .csv) you want to combine. The first file's headers will be used as the template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label htmlFor="file-upload" className="w-full cursor-pointer bg-secondary/50 hover:bg-secondary border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <span className="font-semibold text-primary">Click to upload files</span>
                <span className="text-sm text-muted-foreground">or drag and drop</span>
                <Input id="file-upload" type="file" multiple accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileChange} />
              </label>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Selected Files:</h3>
                  
                  {/* --- CAMBIO --- Altura máxima aumentada a max-h-64 */}
                  <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md text-sm">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        
                        {/* --- CAMBIO --- Botón de eliminar más grande y de color rojo */}
                        <Button variant="destructive" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFile(file)}>
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
               {/* --- CAMBIO --- Texto del botón actualizado */}
               <Button onClick={processFiles} disabled={files.length === 0 || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : `Merge & Download ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </Button>
            </CardFooter>
          </Card>

          {/* --- ELIMINADO --- 
              Toda la sección "2. Download" ha sido eliminada.
          */}

        </div>
      </main>

      <footer className="w-full py-4 text-center text-sm text-muted-foreground">
        Angel Salguero &copy; {currentYear}
      </footer>
    </div>
  );
}