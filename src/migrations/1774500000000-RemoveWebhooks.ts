import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveWebhooks1774500000000 implements MigrationInterface {
    name = 'RemoveWebhooks1774500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "webhooks"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "webhooks" ("id" varchar PRIMARY KEY NOT NULL, "path" varchar NOT NULL, "triggerType" varchar NOT NULL, "workflowId" varchar NOT NULL, "nodeId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_bbccad3ec468915c9576e912530" UNIQUE ("path"))`);
    }
}
