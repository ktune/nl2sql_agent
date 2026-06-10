import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { PrismaService } from '../prisma/prisma.service';
import { AgentService } from '../agent/agent.service';
import { LlmService } from '../llm/llm.service';

@Module({
  controllers: [QueryController],
  providers: [QueryService, PrismaService, AgentService, LlmService],
})
export class QueryModule {}