"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactsSecondaryMenu } from "@/components/contacts-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { batchCreateContacts } from "@/features/contacts/api";
import { useQueryClient } from "@tanstack/react-query";
import { contactsKeys } from "@/features/contacts/queryKeys";
import type { CreateContactRequest } from "@/features/contacts/types";
import { useRouter } from "next/navigation";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

type ImportSource = "google" | "outlook" | "salesforce" | "generic";

interface ImportSourceInfo {
  id: ImportSource;
  name: string;
  description: string;
  icon: string;
  formatDescription: string;
  exampleHeaders: string[];
}

const importSources: ImportSourceInfo[] = [
  {
    id: "google",
    name: "Google Contacts",
    description: "Export from Google Contacts (CSV format)",
    icon: "🔗",
    formatDescription: "Google Contacts exports typically include: Name, Given Name, Family Name, Phone 1 - Value, Phone 2 - Value, etc.",
    exampleHeaders: ["Name", "Given Name", "Family Name", "Phone 1 - Value"]
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Export from Microsoft Outlook (CSV format)",
    icon: "📧",
    formatDescription: "Outlook exports typically include: First Name, Last Name, Business Phone, Home Phone, Mobile Phone, etc.",
    exampleHeaders: ["First Name", "Last Name", "Business Phone", "Mobile Phone"]
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Export from Salesforce (CSV format)",
    icon: "☁️",
    formatDescription: "Salesforce exports typically include: First Name, Last Name, Phone, Mobile Phone, etc.",
    exampleHeaders: ["First Name", "Last Name", "Phone", "Mobile Phone"]
  },
  {
    id: "generic",
    name: "Generic CSV",
    description: "Standard CSV format with name and phone columns",
    icon: "📄",
    formatDescription: "Simple CSV with columns: name, phone (or phone_number)",
    exampleHeaders: ["name", "phone"]
  }
];

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
  timestamp: string;
}

export default function ContactsImportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSource, setSelectedSource] = useState<ImportSource | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError("Please select a CSV file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    setImportResult(null);
  };

  const handleSourceSelect = (source: ImportSource) => {
    setSelectedSource(source);
    setUploadError(null);
    setImportResult(null);
    // Clear file when changing source
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to parse CSV line (handles quoted values)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseCSV = (text: string, source: ImportSource): CreateContactRequest[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header row and one data row");
    }

    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map(h => h.replace(/"/g, '').trim());
    const headersLower = headers.map(h => h.toLowerCase());

    let nameIndex = -1;
    let phoneIndex = -1;

    // Parse based on source
    switch (source) {
      case "google":
        // Google Contacts: "First Name", "Last Name", "Name", "Given Name", "Family Name", "Phone 1 - Value", etc.
        // Try "Name" first, then "First Name" + "Last Name", then "Given Name" + "Family Name"
        nameIndex = headersLower.findIndex(h => h === "name");
        if (nameIndex === -1) {
          // Try "First Name" and "Last Name" (most common in Google exports)
          const firstNameIndex = headersLower.findIndex(h =>
            h.includes("first name") || h === "firstname"
          );
          const lastNameIndex = headersLower.findIndex(h =>
            h.includes("last name") || h === "lastname"
          );
          if (firstNameIndex !== -1 || lastNameIndex !== -1) {
            nameIndex = firstNameIndex !== -1 ? firstNameIndex : lastNameIndex;
          } else {
            // Fallback to "Given Name" and "Family Name"
            const givenNameIndex = headersLower.findIndex(h => h.includes("given name"));
            const familyNameIndex = headersLower.findIndex(h => h.includes("family name"));
            if (givenNameIndex !== -1 || familyNameIndex !== -1) {
              nameIndex = givenNameIndex !== -1 ? givenNameIndex : familyNameIndex;
            }
          }
        }
        phoneIndex = headersLower.findIndex(h =>
          h.includes("phone") && h.includes("value")
        );
        break;

      case "outlook":
        // Outlook: "First Name", "Last Name", "Business Phone", "Home Phone", "Mobile Phone"
        const firstNameIndex = headersLower.findIndex(h =>
          h.includes("first name") || h === "firstname"
        );
        const lastNameIndex = headersLower.findIndex(h =>
          h.includes("last name") || h === "lastname"
        );
        if (firstNameIndex !== -1 || lastNameIndex !== -1) {
          nameIndex = firstNameIndex !== -1 ? firstNameIndex : lastNameIndex;
        }
        phoneIndex = headersLower.findIndex(h =>
          (h.includes("phone") && !h.includes("fax")) ||
          h.includes("mobile") ||
          h.includes("business phone") ||
          h.includes("home phone")
        );
        break;

      case "salesforce":
        // Salesforce: "First Name", "Last Name", "Phone", "Mobile Phone"
        const sfFirstNameIndex = headersLower.findIndex(h =>
          h.includes("first name") || h === "firstname"
        );
        const sfLastNameIndex = headersLower.findIndex(h =>
          h.includes("last name") || h === "lastname"
        );
        if (sfFirstNameIndex !== -1 || sfLastNameIndex !== -1) {
          nameIndex = sfFirstNameIndex !== -1 ? sfFirstNameIndex : sfLastNameIndex;
        }
        phoneIndex = headersLower.findIndex(h =>
          h === "phone" ||
          h.includes("mobile") ||
          h.includes("phone number")
        );
        break;

      case "generic":
      default:
        nameIndex = headersLower.findIndex(h => h === 'name' || h === 'full name' || h === 'fullname' || h === 'contact name');

        if (nameIndex === -1) {
          nameIndex = headersLower.findIndex(h => h.includes('first') && h.includes('name'));
        }

        phoneIndex = headersLower.findIndex(h =>
          h === 'phone' ||
          h === 'phone_number' ||
          h === 'phonenumber' ||
          h === 'mobile' ||
          h === 'cell' ||
          h.includes('phone') ||
          h.includes('mobile')
        );
        break;
    }

    if (nameIndex === -1) {
      throw new Error(`CSV must contain a name column. Found headers: ${headers.join(', ')}`);
    }
    if (phoneIndex === -1) {
      throw new Error(`CSV must contain a phone column. Found headers: ${headers.join(', ')}`);
    }

    const contacts: CreateContactRequest[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      if (values.length < Math.max(nameIndex, phoneIndex) + 1) {
        errors.push(`Row ${i + 1}: Not enough columns`);
        continue;
      }

      let name = '';
      let phone = '';

      // Handle name extraction based on source
      switch (source) {
        case "google":
          // Try "Name" column first
          const nameColumnIndex = headersLower.findIndex(h => h === "name");
          if (nameColumnIndex !== -1 && values[nameColumnIndex]) {
            name = values[nameColumnIndex];
          } else {
            // Try "First Name" + "Last Name"
            const firstNameIndex = headersLower.findIndex(h =>
              h.includes("first name") || h === "firstname"
            );
            const lastNameIndex = headersLower.findIndex(h =>
              h.includes("last name") || h === "lastname"
            );
            if (firstNameIndex !== -1 || lastNameIndex !== -1) {
              const firstName = firstNameIndex !== -1 ? (values[firstNameIndex] || '') : '';
              const lastName = lastNameIndex !== -1 ? (values[lastNameIndex] || '') : '';
              name = `${firstName} ${lastName}`.trim();
            } else {
              // Fallback to "Given Name" + "Family Name"
              const givenNameIndex = headersLower.findIndex(h => h.includes("given name"));
              const familyNameIndex = headersLower.findIndex(h => h.includes("family name"));
              const givenName = givenNameIndex !== -1 ? (values[givenNameIndex] || '') : '';
              const familyName = familyNameIndex !== -1 ? (values[familyNameIndex] || '') : '';
              name = `${givenName} ${familyName}`.trim();
            }
          }
          break;
        case "outlook":
        case "salesforce":
          const firstName = values[headersLower.findIndex(h =>
            h.includes("first name") || h === "firstname"
          )] || '';
          const lastName = values[headersLower.findIndex(h =>
            h.includes("last name") || h === "lastname"
          )] || '';
          name = `${firstName} ${lastName}`.trim() || values[nameIndex] || '';
          break;
        default:
          {
            const genFirstIdx = headersLower.findIndex(h => h.includes('first') && h.includes('name'));
            const genLastIdx = headersLower.findIndex(h => h.includes('last') && h.includes('name'));

            if (genFirstIdx !== -1 && (headersLower[nameIndex].includes('first') || !values[nameIndex])) {
              const f = values[genFirstIdx] || '';
              const l = (genLastIdx !== -1) ? (values[genLastIdx] || '') : '';
              name = `${f} ${l}`.trim();
            }

            if (!name) {
              name = values[nameIndex] || '';
            }
          }
          break;
      }

      // Get phone number (try multiple phone columns if available)
      phone = values[phoneIndex] || '';
      if (!phone || phone === '') {
        // Try alternative phone columns
        const altPhoneIndex = headersLower.findIndex((h, idx) =>
          idx !== phoneIndex &&
          (h.includes("phone") || h.includes("mobile")) &&
          !h.includes("fax")
        );
        if (altPhoneIndex !== -1) {
          phone = values[altPhoneIndex] || '';
        }
      }

      if (!name || name === '') {
        errors.push(`Row ${i + 1}: Missing name`);
        continue;
      }

      // Ensure phone number is in E.164 format
      let phoneNumber = phone.replace(/["']/g, '').trim();
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        phoneNumber = phoneNumber.replace(/\D/g, '');
        if (phoneNumber.length === 10) {
          phoneNumber = `+1${phoneNumber}`; // Default to US
        } else if (phoneNumber.length > 0) {
          phoneNumber = `+${phoneNumber}`;
        }
      }

      if (!phoneNumber || phoneNumber.length < 8) {
        errors.push(`Row ${i + 1}: Invalid phone number for ${name}`);
        continue;
      }

      contacts.push({
        name,
        phone_number: phoneNumber,
      });
    }

    if (contacts.length === 0 && errors.length > 0) {
      throw new Error(`No valid contacts found. Errors: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? ` (and ${errors.length - 5} more)` : ''}`);
    }

    return contacts;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first");
      return;
    }
    if (!selectedSource) {
      setUploadError("Please select an import source first");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const contacts = parseCSV(text, selectedSource);

      if (contacts.length === 0) {
        throw new Error("No valid contacts found in CSV file");
      }

      const result = await batchCreateContacts(contacts);

      setImportResult({
        success: true,
        imported: result.length,
        failed: contacts.length - result.length,
        timestamp: new Date().toLocaleString(),
      });

      // Refresh contacts list
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });

      // Clear file selection
      setSelectedFile(null);
      setSelectedSource(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Optionally redirect to contacts list after a short delay
      setTimeout(() => {
        router.push('/dashboard/contacts/list');
      }, 2000);
    } catch (error) {
      const err = error as Error;
      setUploadError(err.message || "Failed to import contacts");
      setImportResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: [err.message || "Unknown error"],
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Contacts</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <ContactsSecondaryMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />

          <div className="flex-1" />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Import Contacts</h2>
                <p className="text-muted-foreground">Select your source and upload a CSV file to import multiple contacts at once</p>
              </div>

              {/* Import Sources */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Import Source</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {importSources.map((source) => (
                    <Card
                      key={source.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedSource === source.id
                        ? "ring-2 ring-primary"
                        : ""
                        }`}
                      onClick={() => handleSourceSelect(source.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{source.icon}</div>
                            <div>
                              <h4 className="font-medium">{source.name}</h4>
                              <p className="text-sm text-muted-foreground">{source.description}</p>
                            </div>
                          </div>
                          {selectedSource === source.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload CSV File
                  </CardTitle>
                  <CardDescription>
                    {selectedSource
                      ? `Upload your ${importSources.find(s => s.id === selectedSource)?.name} CSV export`
                      : "Please select an import source above"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25"
                      }`}
                  >
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="csv-upload"
                    />
                    <Button
                      variant="secondary"
                      className="text-white"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || !selectedSource}
                    >
                      {selectedFile ? "Change File" : "Choose File"}
                    </Button>
                    {selectedFile && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Selected: {selectedFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">{uploadError}</p>
                      </div>
                    </div>
                  )}

                  {importResult && (
                    <div className={`mt-4 p-3 border rounded-lg ${importResult.success
                      ? "bg-green-50 border-green-200"
                      : "bg-yellow-50 border-yellow-200"
                      }`}>
                      <div className="flex items-center gap-2">
                        {importResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {importResult.success
                              ? `Successfully imported ${importResult.imported} contact${importResult.imported !== 1 ? 's' : ''}`
                              : "Import failed"}
                          </p>
                          {importResult.failed > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {importResult.failed} contact{importResult.failed !== 1 ? 's' : ''} failed to import
                            </p>
                          )}
                          {importResult.errors && importResult.errors.length > 0 && (
                            <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                              {importResult.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {importResult.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedSource && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">CSV Format for {importSources.find(s => s.id === selectedSource)?.name}:</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {importSources.find(s => s.id === selectedSource)?.formatDescription}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                        <li>• Phone numbers will be auto-formatted to E.164 format</li>
                        <li>• Maximum file size: 10MB</li>
                        <li>• Supported format: .csv</li>
                      </ul>
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs font-mono text-muted-foreground">
                          Expected columns (example):<br />
                          {importSources.find(s => s.id === selectedSource)?.exampleHeaders.join(', ')}
                        </p>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p className="font-medium mb-1">How to export:</p>
                        {selectedSource === "google" && (
                          <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Go to Google Contacts (contacts.google.com)</li>
                            <li>Click &quot;Export&quot; in the left sidebar</li>
                            <li>Select &quot;Google CSV&quot; format</li>
                            <li>Click &quot;Export&quot; and download the file</li>
                          </ol>
                        )}
                        {selectedSource === "outlook" && (
                          <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Open Outlook</li>
                            <li>Go to File → Open &amp; Export → Import/Export</li>
                            <li>Select &quot;Export to a file&quot; → &quot;Comma Separated Values&quot;</li>
                            <li>Choose Contacts and export</li>
                          </ol>
                        )}
                        {selectedSource === "salesforce" && (
                          <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Go to Salesforce Contacts</li>
                            <li>Click &quot;Reports &amp; Dashboards&quot; → &quot;Reports&quot;</li>
                            <li>Create or open a Contacts report</li>
                            <li>Click &quot;Export&quot; → &quot;CSV&quot; and download</li>
                          </ol>
                        )}
                        {selectedSource === "generic" && (
                          <p className="text-xs">Use a simple CSV with name and phone columns.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedFile && selectedSource && (
                    <div className="mt-4">
                      <Button
                        variant="secondary"
                        className="w-full text-white"
                        onClick={handleUpload}
                        disabled={isUploading}
                        size="lg"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload and Import Contacts
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
