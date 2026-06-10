import { Injectable, Logger } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';
import { LlmService } from '../llm/llm.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueryService {
  private logger = new Logger('QueryService');

  constructor(
    private agent: AgentService,
    private llm: LlmService,
    private prisma: PrismaService,
  ) {}

  private fixSql(sql: string): string {
    return sql
      // remove table aliases from Employee columns
      .replace(/\be\.manager_name\b/gi, 'manager_name')
      .replace(/\be\.attendance\b/gi, 'attendance')
      .replace(/\be\.first_name\b/gi, 'first_name')
      .replace(/\be\.last_name\b/gi, 'last_name')
      .replace(/\be\.department\b/gi, 'department')
      .replace(/\be\.salary\b/gi, 'salary')
      .replace(/\be\.email\b/gi, 'email')
      .replace(/\be\.designation\b/gi, 'designation')
      .replace(/\be\.manager_id\b/gi, 'manager_id')
      .replace(/\be\.manager_email\b/gi, 'manager_email')
      .replace(/\be\.id\b/gi, 'Employee.id')
      // fix wrong attendance column names
      .replace(/\ba\.attendance_status\b/gi, 'attendance')
      .replace(/\ba\.status\b/gi, 'attendance')
      .replace(/\battendance_status\b/gi, 'attendance')   
      // fix wrong manager column names
      .replace(/\bm\.name\b/gi, 'manager_name')
      .replace(/\bm\.manager_name\b/gi, 'manager_name')
      // remove unnecessary JOIN with Attendance table
      .replace(/\bJOIN\s+Attendance\s+\w+\s+ON\s+\w+\.employee_id\s*=\s*\w+\.id\b/gi, '')
      // remove unnecessary JOIN with Manager table
      .replace(/\bJOIN\s+Manager\s+\w+\s+ON\s+[^\n]+/gi, '')
      // clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  async process(query: string) {
    this.logger.log(`Query received: ${query}`);
    const type = await this.agent.decide(query);

    if (type === 'sql') {
      try {
        let sql = await this.llm.textToSql(query);
        sql = this.fixSql(sql);
        this.logger.log(`Fixed SQL: ${sql}`);

        // block dangerous queries
        const dangerous = ['DELETE', 'DROP', 'UPDATE', 'INSERT', 'TRUNCATE', 'ALTER'];
        const isDangerous = dangerous.some(word =>
          sql.toUpperCase().includes(word)
        );

        if (isDangerous) {
          return {
            type: 'error',
            sql,
            message: 'Only SELECT queries are allowed',
          };
        }

        const results = await this.prisma.$queryRawUnsafe(sql);

        const serializable = JSON.parse(
          JSON.stringify(results, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        );

        // handle empty results
        if (!serializable || serializable.length === 0) {
          return {
            type: 'sql',
            sql,
            answer: [],
            message: 'No results found for your query',
          };
        }

        return { type: 'sql', sql, answer: serializable };

      } catch (err: any) {
        this.logger.error(`SQL execution failed: ${err.message}`);
        return {
          type: 'error',
          sql: null,
          message: `Could not process query: ${err.message}`,
        };
      }
    }

    const answer = await this.llm.generalAnswer(query);
    return { type: 'general', sql: null, answer };
  }
}