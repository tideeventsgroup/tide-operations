import { File, FileImage, FileSpreadsheet, FileText, FileType } from "lucide-react";

export function FileTypeIcon({
  mimeType,
  className,
  strokeWidth,
}: {
  mimeType: string | null | undefined;
  className?: string;
  strokeWidth?: number;
}) {
  if (mimeType === "application/pdf") {
    return <FileText className={className} strokeWidth={strokeWidth} />;
  }
  if (mimeType?.startsWith("image/")) {
    return <FileImage className={className} strokeWidth={strokeWidth} />;
  }
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel") || mimeType?.includes("csv")) {
    return <FileSpreadsheet className={className} strokeWidth={strokeWidth} />;
  }
  if (mimeType?.includes("word") || mimeType?.includes("document")) {
    return <FileType className={className} strokeWidth={strokeWidth} />;
  }
  return <File className={className} strokeWidth={strokeWidth} />;
}
