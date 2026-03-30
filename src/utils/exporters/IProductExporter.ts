import { Response } from "express";
import { Product } from "../../entity/Product";

export interface IProductExporter {
  export(products: Product[], res: Response): Promise<void>;
}
