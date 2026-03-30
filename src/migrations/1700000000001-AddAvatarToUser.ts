import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAvatarToUser1700000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("user", new TableColumn({ name: "avatar", type: "text", isNullable: true }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("user", "avatar");
  }
}
