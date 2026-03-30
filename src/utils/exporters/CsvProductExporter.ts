import { Response } from "express";
import { Parser } from "json2csv";
import { Product } from "../../entity/Product";
import { IProductExporter } from "./IProductExporter";

export class CsvProductExporter implements IProductExporter {
  async export(products: Product[], res: Response): Promise<void> {
    const parser = new Parser({ fields: ["id", "name", "category", "price", "stock", "description", "createdAt"] });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");
    res.send(parser.parse(products));
  }
}
