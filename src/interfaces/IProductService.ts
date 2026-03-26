import { Product } from "../entity/Product";

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface IProductService {
  create(data: Partial<Product>): Promise<Product>;
  getAll(page: number, limit: number): Promise<PaginatedProducts>;
  getById(id: number): Promise<Product>;
  update(id: number, data: Partial<Product>): Promise<Product>;
  delete(id: number): Promise<void>;
  search(query: string): Promise<Product[]>;
}
