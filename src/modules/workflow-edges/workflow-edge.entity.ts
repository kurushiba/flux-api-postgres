import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Workflow } from '../workflows/workflow.entity';

@Entity('workflow_edges')
export class WorkflowEdge {
  @PrimaryColumn()
  id: string; // UUID v4（React Flow の edge.id と一致）

  @ManyToOne(() => Workflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @Column()
  workflowId: string;

  @Column()
  sourceNodeId: string;

  @Column()
  targetNodeId: string;
}
