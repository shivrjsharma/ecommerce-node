import { Request, Response, NextFunction } from "express";
import { IProductService } from "../interfaces/IProductService";
import { ApiResponse } from "../utils/ApiResponse";
import { MSG } from "../constants/messages";
import { getProductExporter } from "../utils/exporters/exporterFactory";
import { AppError } from "../utils/AppError";

export class ProductController {
  constructor(private readonly productService: IProductService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.productService.create(req.body), MSG.PRODUCT.CREATED, 201);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      ApiResponse.success(res, await this.productService.getAll(page, limit), MSG.PRODUCT.ALL_FETCHED);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.productService.getById(Number(req.params.id)), MSG.PRODUCT.FETCHED);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.productService.update(Number(req.params.id), req.body), MSG.PRODUCT.UPDATED);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.productService.delete(Number(req.params.id));
      ApiResponse.success(res, null, MSG.PRODUCT.DELETED);
    } catch (err) {
      next(err);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      ApiResponse.success(res, await this.productService.search(String(req.query.query || "")), MSG.PRODUCT.SEARCH_RESULTS);
    } catch (err) {
      next(err);
    }
  };

  export = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exporter = getProductExporter(String(req.params.format));
      if (!exporter) throw new AppError("Invalid format. Use csv, xlsx or pdf", 400);
      const { products } = await this.productService.getAll(1, 10000);
      await exporter.export(products, res);
    } catch (err) {
      next(err);
    }
  };
}
