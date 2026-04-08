import { DataSource } from 'typeorm';
import { WorkflowNode } from '../../workflow-nodes/workflow-node.entity';
import { Credential } from '../../credentials/credential.entity';
import { decrypt } from '../../../common/encryption';
import { initialExecutor } from './initial.executor';
import { httpRequestExecutor } from './http-request.executor';
import { openaiExecutor } from './openai.executor';
import { anthropicExecutor } from './anthropic.executor';
import { geminiExecutor } from './gemini.executor';
import { discordExecutor } from './discord.executor';
import { slackExecutor } from './slack.executor';

async function getApiKey(node: WorkflowNode, datasource: DataSource): Promise<string | undefined> {
  if (!node.credentialId) return undefined;
  const credRepo = datasource.getRepository(Credential);
  const cred = await credRepo.findOne({ where: { id: node.credentialId } });
  if (!cred) return undefined;
  const decrypted = decrypt(cred.encryptedData);
  const credData = JSON.parse(decrypted) as { apiKey: string };
  return credData.apiKey;
}

export async function executeNode(
  node: WorkflowNode,
  previousOutput: unknown,
  datasource: DataSource
): Promise<unknown> {
  switch (node.type) {
    case 'INITIAL':
      return initialExecutor(node, previousOutput);
    case 'HTTP_REQUEST':
      return httpRequestExecutor(node, previousOutput);
    case 'OPENAI': {
      const apiKey = await getApiKey(node, datasource);
      return openaiExecutor(node, previousOutput, apiKey);
    }
    case 'ANTHROPIC': {
      const apiKey = await getApiKey(node, datasource);
      return anthropicExecutor(node, previousOutput, apiKey);
    }
    case 'GEMINI': {
      const apiKey = await getApiKey(node, datasource);
      return geminiExecutor(node, previousOutput, apiKey);
    }
    case 'DISCORD':
      return discordExecutor(node, previousOutput);
    case 'SLACK':
      return slackExecutor(node, previousOutput);
    default:
      throw new Error(`Unknown node type: ${(node as WorkflowNode).type}`);
  }
}
