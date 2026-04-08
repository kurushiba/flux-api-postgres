import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveWorkflowIsActive1774429179988 implements MigrationInterface {
    name = 'RemoveWorkflowIsActive1774429179988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workflows" DROP COLUMN "isActive"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workflows" ADD COLUMN "isActive" boolean NOT NULL DEFAULT (0)`);
    }
}
