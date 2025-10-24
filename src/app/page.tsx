"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileText, Loader2, X, AlertTriangle, Sun, Moon } from 'lucide-react';
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
  const [fileName, setFileName] = useState('Order_Form_Output');
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
        // Creamos un Set con claves únicas (nombre-tamaño-fecha) de los archivos existentes
        const existingFileKeys = new Set(
          prevFiles.map(f => `${f.name}-${f.size}-${f.lastModified}`)
        );

        // Filtramos los nuevos archivos para añadir solo los que no existan ya
        const uniqueNewFiles = newFiles.filter(f => {
          const fileKey = `${f.name}-${f.size}-${f.lastModified}`;
          return !existingFileKeys.has(fileKey);
        });

        // Retornamos la lista combinada
        return [...prevFiles, ...uniqueNewFiles];
      });

      // Es correcto resetear esto, ya que la lista de archivos cambió
      // y se debe generar un nuevo merge.
      setMergedData([]);
      setHeaders([]);
      setError(null);
    }
  };
  
  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
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

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while processing the files. Please ensure they are valid Excel files.");
      setMergedData([]);
      setHeaders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (mergedData.length === 0) {
      setError("No data available to download.");
      return;
    }
    setIsLoading(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(mergedData, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'MergedData');
      XLSX.writeFile(workbook, `${fileName || 'Order_Form_Output'}.xlsx`);
    } catch (e) {
      console.error(e);
      setError("An error occurred while creating the download file.");
    } finally {
      setIsLoading(false);
    }
  };
  
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">
          <Card className="w-full shadow-lg">
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
                  <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md text-sm">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeFile(file)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
               <Button onClick={processFiles} disabled={files.length === 0 || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : `Merge ${files.length} File${files.length !== 1 ? 's' : ''}`}
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-8">
             {error && (
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-6 w-6"/>
                        2. Download
                    </CardTitle>
                    <CardDescription>Download your combined Order Form as a single Excel file.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2 items-center">
                    <Input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter filename"
                        className="flex-grow"
                        disabled={mergedData.length === 0}
                    />
                    <span className="text-muted-foreground self-center font-medium">.xlsx</span>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleDownload} disabled={mergedData.length === 0 || isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {isLoading && mergedData.length === 0 ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Preparing...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download Order Form
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-sm text-muted-foreground">
        Angel Salguero &copy; {currentYear}
      </footer>
    </div>
  );
}
