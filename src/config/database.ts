import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Product } from "../entity/Product";
import { CartItem } from "../entity/CartItem";
import { Order } from "../entity/Order";
import { OrderItem } from "../entity/OrderItem";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: process.env.DB_DATABASE || "database.sqlite",
  synchronize: false,
  logging: false,
  entities: [User, Product, CartItem, Order, OrderItem],
  migrations: ["dist/migrations/*.js"],
});
