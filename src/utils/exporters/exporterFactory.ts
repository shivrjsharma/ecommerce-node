import { IProductExporter } from "./IProductExporter";
import { CsvProductExporter } from "./CsvProductExporter";
import { XlsProductExporter } from "./XlsProductExporter";
import { PdfProductExporter } from "./PdfProductExporter";

const exporters: Record<string, IProductExporter> = {
  csv: new CsvProductExporter(),
  xlsx: new XlsProductExporter(),
  pdf: new PdfProductExporter(),
};

export function getProductExporter(format: string): IProductExporter | null {
  return exporters[format.toLowerCase()] ?? null;
}
