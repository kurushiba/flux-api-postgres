import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Workflow } from '../workflows/workflow.entity';

export type NodeType =
  | 'INITIAL'
  | 'HTTP_REQUEST'
  | 'OPENAI'
  | 'ANTHROPIC'
  | 'GEMINI'
  | 'DISCORD'
  | 'SLACK';

@Entity('workflow_nodes')
export class WorkflowNode {
  @PrimaryColumn()
  id: string; // UUID v4（React Flow の node.id と一致）

  @ManyToOne(() => Workflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @Column()
  workflowId: string;

  @Column({ type: 'varchar' })
  type: NodeType;

  @Column()
  label: string;

  @Column({ type: 'float' })
  positionX: number;

  @Column({ type: 'float' })
  positionY: number;

  @Column({ type: 'text', nullable: true })
  parameters: string | null; // JSON 文字列（ノード固有の設定）

  @Column({ type: 'varchar', nullable: true })
  credentialId: string | null;
}
