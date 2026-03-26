import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "text", default: UserRole.USER })
  role!: UserRole;

  // @Column({ nullable: true, type: "text" })
  // zipcode?: string | null;

  // @Column({ nullable: true, type: "text" })
  // phoneNumber?: string | null;

  @Column({ nullable: true, type: "text" })
  refreshToken?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
