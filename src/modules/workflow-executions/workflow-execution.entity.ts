import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Workflow } from '../workflows/workflow.entity';

export type ExecutionStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

@Entity('workflow_executions')
export class WorkflowExecution {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Workflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @Column()
  workflowId: string;

  @Column({ type: 'varchar' })
  status: ExecutionStatus;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;
}
