import { ILike, Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Product } from "../entity/Product";
import { IProductService } from "../interfaces/IProductService";
import { AppError } from "../utils/AppError";
import { MSG } from "../constants/messages";
import logger, { sanitizeLog } from "../utils/logger";
import cache from "../utils/cache";

export class ProductService implements IProductService {
  private get repo(): Repository<Product> {
    return AppDataSource.getRepository(Product);
  }

  private invalidateProduct(id: number) {
    cache.del(`product:${id}`);
    cache.keys().filter((k) => k.startsWith("products:") || k.startsWith("product:search:")).forEach((k) => cache.del(k));
  }

  async create(data: Partial<Product>) {
    logger.debug(`[ProductService] create → name=${sanitizeLog(data.name)}`);
    try {
      const product = await this.repo.save(this.repo.create(data));
      cache.keys().filter((k) => k.startsWith("products:")).forEach((k) => cache.del(k));
      logger.info(`[ProductService] created product id=${sanitizeLog(product.id)}`);
      return product;
    } catch (err) {
      logger.error("[ProductService] create failed", { err });
      throw err instanceof AppError ? err : new AppError(MSG.PRODUCT.CREATE_FAILED, 500);
    }
  }

  async getAll(page = 1, limit = 10) {
    const key = `products:${page}:${limit}`;
    logger.debug(`[ProductService] getAll → page=${sanitizeLog(page)} limit=${sanitizeLog(limit)}`);
    try {
      const cached = cache.get(key);
      if (cached) return cached as Awaited<ReturnType<IProductService["getAll"]>>;
      const [products, total] = await this.repo.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: "DESC" },
      });
      const result = { products, total, page, pages: Math.ceil(total / limit) };
      cache.set(key, result);
      return result;
    } catch (err) {
      logger.error("[ProductService] getAll failed", { err });
      throw err instanceof AppError ? err : new AppError(MSG.PRODUCT.FETCH_ALL_FAILED, 500);
    }
  }

  async getById(id: number) {
    const key = `product:${id}`;
    logger.debug(`[ProductService] getById → id=${sanitizeLog(id)}`);
    try {
      const cached = cache.get(key);
      if (cached) return cached as Product;
      const product = await this.repo.findOneBy({ id });
      if (!product) throw new AppError(MSG.PRODUCT.NOT_FOUND, 404);
      cache.set(key, product);
      return product;
    } catch (err) {
      logger.error(`[ProductService] getById failed → id=${sanitizeLog(id)}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.PRODUCT.FETCH_FAILED, 500);
    }
  }

  async update(id: number, data: Partial<Product>) {
    logger.debug(`[ProductService] update → id=${sanitizeLog(id)}`);
    try {
      await this.getById(id);
      await this.repo.update(id, data);
      this.invalidateProduct(id);
      logger.info(`[ProductService] updated product id=${sanitizeLog(id)}`);
      return this.getById(id);
    } catch (err) {
      logger.error(`[ProductService] update failed → id=${sanitizeLog(id)}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.PRODUCT.UPDATE_FAILED, 500);
    }
  }

  async delete(id: number) {
    logger.debug(`[ProductService] delete → id=${sanitizeLog(id)}`);
    try {
      await this.getById(id);
      await this.repo.delete(id);
      this.invalidateProduct(id);
      logger.info(`[ProductService] deleted product id=${sanitizeLog(id)}`);
    } catch (err) {
      logger.error(`[ProductService] delete failed → id=${sanitizeLog(id)}`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.PRODUCT.DELETE_FAILED, 500);
    }
  }

  async search(query: string) {
    const key = `product:search:${query}`;
    logger.debug(`[ProductService] search → query="${sanitizeLog(query)}"`);
    try {
      const cached = cache.get(key);
      if (cached) return cached as Product[];
      const results = await this.repo.find({
        where: [{ name: ILike(`%${query}%`) }, { category: ILike(`%${query}%`) }],
        order: { createdAt: "DESC" },
      });
      cache.set(key, results);
      logger.debug(`[ProductService] search → found ${sanitizeLog(results.length)} results`);
      return results;
    } catch (err) {
      logger.error(`[ProductService] search failed → query="${sanitizeLog(query)}"`, { err });
      throw err instanceof AppError ? err : new AppError(MSG.PRODUCT.SEARCH_FAILED, 500);
    }
  }
}
