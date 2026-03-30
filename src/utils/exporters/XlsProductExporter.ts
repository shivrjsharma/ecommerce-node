import { Response } from "express";
import ExcelJS from "exceljs";
import { Product } from "../../entity/Product";
import { IProductExporter } from "./IProductExporter";

const fields = ["id", "name", "category", "price", "stock", "description", "createdAt"];

export class XlsProductExporter implements IProductExporter {
  async export(products: Product[], res: Response): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products");
    sheet.columns = fields.map((f) => ({ header: f.toUpperCase(), key: f, width: 20 }));
    products.forEach((p) => sheet.addRow(p));
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  }
}
