import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AgentService {
  async decide(query: string): Promise<'sql' | 'general'> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const res = await axios.post(`${ollamaUrl}/api/generate`,  {
      model: 'llama3',
      prompt: `You are a query classifier.

The database has an Employee table with: id, name, department, gender, attendance_status, date, shift_start_time, shift_end_time.

Classify the query as "sql" if it:
- Asks about employees, staff, workers
- Asks about attendance (present, absent, late)
- Asks about departments, gender, shifts
- Uses words like: show, list, find, give, get, count, how many, top, first
- Asks for employee data or records

Classify as "general" if it:
- Asks about weather, news, jokes
- Is a greeting (hi, hello, how are you)
- Asks about general knowledge unrelated to employees

Answer with ONLY one word: "sql" or "general"

Query: ${query}
Answer:`,
      stream: false,
    });

    const answer = res.data.response.trim().toLowerCase();
    if (answer.includes('sql')) return 'sql';
    return 'general';
  }
}