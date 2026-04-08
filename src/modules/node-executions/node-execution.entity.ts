import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { WorkflowExecution } from '../workflow-executions/workflow-execution.entity';
import { ExecutionStatus } from '../workflow-executions/workflow-execution.entity';

@Entity('node_executions')
export class NodeExecution {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => WorkflowExecution, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowExecutionId' })
  workflowExecution: WorkflowExecution;

  @Column()
  workflowExecutionId: string;

  @Column()
  nodeId: string;

  @Column()
  nodeName: string; // 実行時のラベルをスナップショット

  @Column({ type: 'varchar' })
  status: ExecutionStatus;

  @Column({ type: 'text', nullable: true })
  inputData: string | null; // JSON 文字列

  @Column({ type: 'text', nullable: true })
  outputData: string | null; // JSON 文字列

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;
}
