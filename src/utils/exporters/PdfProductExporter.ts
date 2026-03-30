import { Response } from "express";
import PDFDocument from "pdfkit";
import { Product } from "../../entity/Product";
import { IProductExporter } from "./IProductExporter";

export class PdfProductExporter implements IProductExporter {
  async export(products: Product[], res: Response): Promise<void> {
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");
    doc.pipe(res);

    doc.fontSize(16).text("Product List", { align: "center" }).moveDown();

    const colWidths = [30, 150, 100, 60, 50, 150];
    const headers = ["ID", "Name", "Category", "Price", "Stock", "Description"];
    let x = doc.page.margins.left;
    const y = doc.y;

    headers.forEach((h, i) => {
      doc.fontSize(10).font("Helvetica-Bold").text(h, x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });

    doc.moveDown(0.5);
    products.forEach((p) => {
      x = doc.page.margins.left;
      const rowY = doc.y;
      [p.id, p.name, p.category ?? "", p.price, p.stock, p.description ?? ""].forEach((val, i) => {
        doc.fontSize(9).font("Helvetica").text(String(val), x, rowY, { width: colWidths[i], ellipsis: true });
        x += colWidths[i];
      });
      doc.moveDown(0.5);
    });

    doc.end();
  }
}
