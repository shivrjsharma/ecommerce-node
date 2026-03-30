import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddZipcodeAndPhoneToUser1700000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("user", [
      new TableColumn({ name: "zipcode", type: "text", isNullable: true }),
      new TableColumn({ name: "phoneNumber", type: "text", isNullable: true }),
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("user", ["zipcode", "phoneNumber"]);
  }
}
