import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkflowEntities1774006400359 implements MigrationInterface {
    name = 'AddWorkflowEntities1774006400359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "workflows" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (0), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "workflow_executions" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "status" varchar NOT NULL, "errorMessage" text, "startedAt" datetime NOT NULL DEFAULT (datetime('now')), "finishedAt" datetime)`);
        await queryRunner.query(`CREATE TABLE "workflow_edges" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "sourceNodeId" varchar NOT NULL, "targetNodeId" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "workflow_nodes" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL, "positionX" float NOT NULL, "positionY" float NOT NULL, "parameters" text, "credentialId" varchar)`);
        await queryRunner.query(`CREATE TABLE "webhooks" ("id" varchar PRIMARY KEY NOT NULL, "path" varchar NOT NULL, "triggerType" varchar NOT NULL, "workflowId" varchar NOT NULL, "nodeId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_bbccad3ec468915c9576e912530" UNIQUE ("path"))`);
        await queryRunner.query(`CREATE TABLE "node_executions" ("id" varchar PRIMARY KEY NOT NULL, "workflowExecutionId" varchar NOT NULL, "nodeId" varchar NOT NULL, "nodeName" varchar NOT NULL, "status" varchar NOT NULL, "inputData" text, "outputData" text, "errorMessage" text, "startedAt" datetime NOT NULL DEFAULT (datetime('now')), "finishedAt" datetime)`);
        await queryRunner.query(`CREATE TABLE "credentials" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "encryptedData" varchar NOT NULL, "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_workflows" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (0), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_e6b7312458454123287286afa6e" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_workflows"("id", "name", "isActive", "userId", "createdAt", "updatedAt") SELECT "id", "name", "isActive", "userId", "createdAt", "updatedAt" FROM "workflows"`);
        await queryRunner.query(`DROP TABLE "workflows"`);
        await queryRunner.query(`ALTER TABLE "temporary_workflows" RENAME TO "workflows"`);
        await queryRunner.query(`CREATE TABLE "temporary_workflow_executions" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "status" varchar NOT NULL, "errorMessage" text, "startedAt" datetime NOT NULL DEFAULT (datetime('now')), "finishedAt" datetime, CONSTRAINT "FK_2cb399c231cb3f82c63506794bc" FOREIGN KEY ("workflowId") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_workflow_executions"("id", "workflowId", "status", "errorMessage", "startedAt", "finishedAt") SELECT "id", "workflowId", "status", "errorMessage", "startedAt", "finishedAt" FROM "workflow_executions"`);
        await queryRunner.query(`DROP TABLE "workflow_executions"`);
        await queryRunner.query(`ALTER TABLE "temporary_workflow_executions" RENAME TO "workflow_executions"`);
        await queryRunner.query(`CREATE TABLE "temporary_workflow_edges" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "sourceNodeId" varchar NOT NULL, "targetNodeId" varchar NOT NULL, CONSTRAINT "FK_f25cd0b36d51116ebb07fa4184d" FOREIGN KEY ("workflowId") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_workflow_edges"("id", "workflowId", "sourceNodeId", "targetNodeId") SELECT "id", "workflowId", "sourceNodeId", "targetNodeId" FROM "workflow_edges"`);
        await queryRunner.query(`DROP TABLE "workflow_edges"`);
        await queryRunner.query(`ALTER TABLE "temporary_workflow_edges" RENAME TO "workflow_edges"`);
        await queryRunner.query(`CREATE TABLE "temporary_workflow_nodes" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL, "positionX" float NOT NULL, "positionY" float NOT NULL, "parameters" text, "credentialId" varchar, CONSTRAINT "FK_e7ae66cdc966c0c893246c4d6dd" FOREIGN KEY ("workflowId") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_workflow_nodes"("id", "workflowId", "type", "label", "positionX", "positionY", "parameters", "credentialId") SELECT "id", "workflowId", "type", "label", "positionX", "positionY", "parameters", "credentialId" FROM "workflow_nodes"`);
        await queryRunner.query(`DROP TABLE "workflow_nodes"`);
        await queryRunner.query(`ALTER TABLE "temporary_workflow_nodes" RENAME TO "workflow_nodes"`);
        await queryRunner.query(`CREATE TABLE "temporary_node_executions" ("id" varchar PRIMARY KEY NOT NULL, "workflowExecutionId" varchar NOT NULL, "nodeId" varchar NOT NULL, "nodeName" varchar NOT NULL, "status" varchar NOT NULL, "inputData" text, "outputData" text, "errorMessage" text, "startedAt" datetime NOT NULL DEFAULT (datetime('now')), "finishedAt" datetime, CONSTRAINT "FK_e7e94e3369ead4f399ce6b12b4d" FOREIGN KEY ("workflowExecutionId") REFERENCES "workflow_executions" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_node_executions"("id", "workflowExecutionId", "nodeId", "nodeName", "status", "inputData", "outputData", "errorMessage", "startedAt", "finishedAt") SELECT "id", "workflowExecutionId", "nodeId", "nodeName", "status", "inputData", "outputData", "errorMessage", "startedAt", "finishedAt" FROM "node_executions"`);
        await queryRunner.query(`DROP TABLE "node_executions"`);
        await queryRunner.query(`ALTER TABLE "temporary_node_executions" RENAME TO "node_executions"`);
        await queryRunner.query(`CREATE TABLE "temporary_credentials" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "encryptedData" varchar NOT NULL, "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_8d3a07b8e994962efe57ebd0f20" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_credentials"("id", "name", "type", "encryptedData", "userId", "createdAt", "updatedAt") SELECT "id", "name", "type", "encryptedData", "userId", "createdAt", "updatedAt" FROM "credentials"`);
        await queryRunner.query(`DROP TABLE "credentials"`);
        await queryRunner.query(`ALTER TABLE "temporary_credentials" RENAME TO "credentials"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credentials" RENAME TO "temporary_credentials"`);
        await queryRunner.query(`CREATE TABLE "credentials" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "type" varchar NOT NULL, "encryptedData" varchar NOT NULL, "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "credentials"("id", "name", "type", "encryptedData", "userId", "createdAt", "updatedAt") SELECT "id", "name", "type", "encryptedData", "userId", "createdAt", "updatedAt" FROM "temporary_credentials"`);
        await queryRunner.query(`DROP TABLE "temporary_credentials"`);
        await queryRunner.query(`ALTER TABLE "node_executions" RENAME TO "temporary_node_executions"`);
        await queryRunner.query(`CREATE TABLE "node_executions" ("id" varchar PRIMARY KEY NOT NULL, "workflowExecutionId" varchar NOT NULL, "nodeId" varchar NOT NULL, "nodeName" varchar NOT NULL, "status" varchar NOT NULL, "inputData" text, "outputData" text, "errorMessage" text, "startedAt" datetime NOT NULL DEFAULT (datetime('now')), "finishedAt" datetime)`);
        await queryRunner.query(`INSERT INTO "node_executions"("id", "workflowExecutionId", "nodeId", "nodeName", "status", "inputData", "outputData", "errorMessage", "startedAt", "finishedAt") SELECT "id", "workflowExecutionId", "nodeId", "nodeName", "status", "inputData", "outputData", "errorMessage", "startedAt", "finishedAt" FROM "temporary_node_executions"`);
        await queryRunner.query(`DROP TABLE "temporary_node_executions"`);
        await queryRunner.query(`ALTER TABLE "workflow_nodes" RENAME TO "temporary_workflow_nodes"`);
        await queryRunner.query(`CREATE TABLE "workflow_nodes" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "type" varchar NOT NULL, "label" varchar NOT NULL, "positionX" float NOT NULL, "positionY" float NOT NULL, "parameters" text, "credentialId" varchar)`);
        await queryRunner.query(`INSERT INTO "workflow_nodes"("id", "workflowId", "type", "label", "positionX", "positionY", "parameters", "credentialId") SELECT "id", "workflowId", "type", "label", "positionX", "positionY", "parameters", "credentialId" FROM "temporary_workflow_nodes"`);
        await queryRunner.query(`DROP TABLE "temporary_workflow_nodes"`);
        await queryRunner.query(`ALTER TABLE "workflow_edges" RENAME TO "temporary_workflow_edges"`);
        await queryRunner.query(`CREATE TABLE "workflow_edges" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "sourceNodeId" varchar NOT NULL, "targetNodeId" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "workflow_edges"("id", "workflowId", "sourceNodeId", "targetNodeId") SELECT "id", "workflowId", "sourceNodeId", "targetNodeId" FROM "temporary_workflow_edges"`);
        await queryRunner.query(`DROP TABLE "temporary_workflow_edges"`);
        await queryRunner.query(`ALTER TABLE "workflow_executions" RENAME TO "temporary_workflow_executions"`);
        await queryRunner.query(`CREATE TABLE "workflow_executions" ("id" varchar PRIMARY KEY NOT NULL, "workflowId" varchar NOT NULL, "status" varchar NOT NULL, "errorMessage" text, "startedAt" datetime NOT NULL DEFAULT (datetime('now')), "finishedAt" datetime)`);
        await queryRunner.query(`INSERT INTO "workflow_executions"("id", "workflowId", "status", "errorMessage", "startedAt", "finishedAt") SELECT "id", "workflowId", "status", "errorMessage", "startedAt", "finishedAt" FROM "temporary_workflow_executions"`);
        await queryRunner.query(`DROP TABLE "temporary_workflow_executions"`);
        await queryRunner.query(`ALTER TABLE "workflows" RENAME TO "temporary_workflows"`);
        await queryRunner.query(`CREATE TABLE "workflows" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "isActive" boolean NOT NULL DEFAULT (0), "userId" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "workflows"("id", "name", "isActive", "userId", "createdAt", "updatedAt") SELECT "id", "name", "isActive", "userId", "createdAt", "updatedAt" FROM "temporary_workflows"`);
        await queryRunner.query(`DROP TABLE "temporary_workflows"`);
        await queryRunner.query(`DROP TABLE "credentials"`);
        await queryRunner.query(`DROP TABLE "node_executions"`);
        await queryRunner.query(`DROP TABLE "webhooks"`);
        await queryRunner.query(`DROP TABLE "workflow_nodes"`);
        await queryRunner.query(`DROP TABLE "workflow_edges"`);
        await queryRunner.query(`DROP TABLE "workflow_executions"`);
        await queryRunner.query(`DROP TABLE "workflows"`);
    }

}
