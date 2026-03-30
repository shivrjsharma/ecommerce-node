import { Response } from "express";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { Product } from "../../entity/Product";
import { IProductExporter } from "./IProductExporter";

const COL_WIDTHS = [35, 140, 100, 60, 50, 145];
const HEADERS = ["ID", "Name", "Category", "Price", "Stock", "Description"];
const ROW_HEIGHT = 22;
const HEADER_HEIGHT = 26;

const COLORS = {
  headerBg: "#2c3e50",
  headerText: "#ffffff",
  rowEven: "#f2f2f2",
  rowOdd: "#ffffff",
  border: "#cccccc",
  title: "#2c3e50",
  accent: "#e74c3c",
};

export class PdfProductExporter implements IProductExporter {
  async export(products: Product[], res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

      doc.on("error", reject);
      res.on("error", reject);
      res.on("finish", resolve);
      doc.pipe(res);

      // ── Logo top-left ──────────────────────────────────────────
      const logoPath = path.resolve(process.cwd(), "assets/logo.gif");
      if (fs.existsSync(logoPath)) {
        console.log("Adding logo to PDF from:", logoPath);
        doc.image(logoPath, 30, 30, { width: 100, height: 50 });
      }

      // ── Header section ─────────────────────────────────────────
      doc.fillColor(COLORS.title).fontSize(20).font("Helvetica-Bold")
        .text("Product List", 0, 40, { align: "center" });

      doc.fillColor(COLORS.accent).fontSize(9).font("Helvetica")
        .text(`Generated: ${new Date().toLocaleString()}`, 0, 65, { align: "center" });

      doc.moveDown(2);

      // ── Table ──────────────────────────────────────────────────
      const tableTop = doc.y;
      const tableLeft = doc.page.margins.left;
      const tableWidth = COL_WIDTHS.reduce((a, b) => a + b, 0);

      // header row background
      doc.rect(tableLeft, tableTop, tableWidth, HEADER_HEIGHT)
        .fill(COLORS.headerBg);

      // header text
      let x = tableLeft;
      HEADERS.forEach((h, i) => {
        doc.fillColor(COLORS.headerText).fontSize(9).font("Helvetica-Bold")
          .text(h, x + 4, tableTop + 8, { width: COL_WIDTHS[i] - 8, ellipsis: true });
        x += COL_WIDTHS[i];
      });

      // rows
      products.forEach((p, rowIndex) => {
        const rowY = tableTop + HEADER_HEIGHT + rowIndex * ROW_HEIGHT;

        // check for new page
        if (rowY + ROW_HEIGHT > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
        }

        const finalRowY = tableTop + HEADER_HEIGHT + rowIndex * ROW_HEIGHT;
        const bgColor = rowIndex % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd;

        // row background
        doc.rect(tableLeft, finalRowY, tableWidth, ROW_HEIGHT).fill(bgColor);

        // row border bottom
        doc.moveTo(tableLeft, finalRowY + ROW_HEIGHT)
          .lineTo(tableLeft + tableWidth, finalRowY + ROW_HEIGHT)
          .strokeColor(COLORS.border).lineWidth(0.5).stroke();

        // cell values
        x = tableLeft;
        const values = [p.id, p.name, p.category ?? "", `$${Number(p.price).toFixed(2)}`, p.stock, p.description ?? ""];
        values.forEach((val, i) => {
          doc.fillColor("#333333").fontSize(8).font("Helvetica")
            .text(String(val), x + 4, finalRowY + 7, { width: COL_WIDTHS[i] - 8, ellipsis: true });
          x += COL_WIDTHS[i];
        });

        // vertical col borders
        x = tableLeft;
        COL_WIDTHS.forEach((w) => {
          doc.moveTo(x, finalRowY).lineTo(x, finalRowY + ROW_HEIGHT)
            .strokeColor(COLORS.border).lineWidth(0.5).stroke();
          x += w;
        });
        doc.moveTo(x, finalRowY).lineTo(x, finalRowY + ROW_HEIGHT)
          .strokeColor(COLORS.border).lineWidth(0.5).stroke();
      });

      // outer table border
      const tableHeight = HEADER_HEIGHT + products.length * ROW_HEIGHT;
      doc.rect(tableLeft, tableTop, tableWidth, tableHeight)
        .strokeColor(COLORS.headerBg).lineWidth(1).stroke();

      // ── Footer ─────────────────────────────────────────────────
      doc.fillColor("#999999").fontSize(8).font("Helvetica")
        .text(`Total Products: ${products.length}`, tableLeft, tableTop + tableHeight + 10);

      doc.end();
    });
  }
}
