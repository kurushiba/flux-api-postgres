import { MigrationInterface, QueryRunner } from "typeorm";

export class InitPostgres1762220104380 implements MigrationInterface {
    name = 'InitPostgres1762220104380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "email" varchar NOT NULL,
                "password" varchar NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email")`);

        await queryRunner.query(`
            CREATE TABLE "workflows" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "userId" varchar NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT "FK_workflows_userId" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "workflow_nodes" (
                "id" varchar PRIMARY KEY NOT NULL,
                "workflowId" varchar NOT NULL,
                "type" varchar NOT NULL,
                "label" varchar NOT NULL,
                "positionX" float NOT NULL,
                "positionY" float NOT NULL,
                "parameters" text,
                "credentialId" varchar,
                CONSTRAINT "FK_workflow_nodes_workflowId" FOREIGN KEY ("workflowId") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "workflow_edges" (
                "id" varchar PRIMARY KEY NOT NULL,
                "workflowId" varchar NOT NULL,
                "sourceNodeId" varchar NOT NULL,
                "targetNodeId" varchar NOT NULL,
                CONSTRAINT "FK_workflow_edges_workflowId" FOREIGN KEY ("workflowId") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "credentials" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "type" varchar NOT NULL,
                "encryptedData" varchar NOT NULL,
                "userId" varchar NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT "FK_credentials_userId" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "workflow_executions" (
                "id" varchar PRIMARY KEY NOT NULL,
                "workflowId" varchar NOT NULL,
                "status" varchar NOT NULL,
                "errorMessage" text,
                "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "finishedAt" TIMESTAMP,
                CONSTRAINT "FK_workflow_executions_workflowId" FOREIGN KEY ("workflowId") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "node_executions" (
                "id" varchar PRIMARY KEY NOT NULL,
                "workflowExecutionId" varchar NOT NULL,
                "nodeId" varchar NOT NULL,
                "nodeName" varchar NOT NULL,
                "status" varchar NOT NULL,
                "inputData" text,
                "outputData" text,
                "errorMessage" text,
                "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "finishedAt" TIMESTAMP,
                CONSTRAINT "FK_node_executions_workflowExecutionId" FOREIGN KEY ("workflowExecutionId") REFERENCES "workflow_executions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "node_executions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workflow_executions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "credentials"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workflow_edges"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workflow_nodes"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workflows"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    }
}
