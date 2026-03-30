import { EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "./config/database";

export function getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
  return AppDataSource.getRepository(entity);
}
