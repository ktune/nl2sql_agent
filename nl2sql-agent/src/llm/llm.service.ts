import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LlmService {

  async textToSql(query: string): Promise<string> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    const prompt = `You are a MySQL query generator. You ONLY generate simple SELECT queries.

AVAILABLE TABLE:
Employee (id, first_name, last_name, email, department, designation, manager_name, manager_id, manager_email, attendance, salary)

STRICT RULES - NEVER BREAK THESE:
1. ONLY query the Employee table directly unless a JOIN is absolutely needed
2. attendance values are ONLY: 'present' or 'absent'
3. NEVER use table aliases like 'e.manager_name' - write column names directly
4. NEVER join Attendance table - use Employee.attendance column instead
5. NEVER join Manager table - use Employee.manager_name column instead
6. Return ONLY the SQL query, no explanation, no markdown
7. Always end with semicolon
8. If number mentioned → add LIMIT
9. NEVER use 'name' column - use 'first_name' and 'last_name' instead

CORRECT EXAMPLES:
Q: "count absent employees whose manager is Merle Glantz"
A: SELECT COUNT(*) FROM Employee WHERE attendance = 'absent' AND manager_name = 'Merle Glantz';

Q: "show all absent employees"
A: SELECT * FROM Employee WHERE attendance = 'absent';

Q: "show top 5 highest paid employees"
A: SELECT * FROM Employee ORDER BY salary DESC LIMIT 5;

Q: "list employees in Engineering"
A: SELECT * FROM Employee WHERE department = 'Engineering';

Q: "give all employees with their manager id"
A: SELECT first_name, last_name, manager_id FROM Employee;

Q: "how many employees are present in Sales"
A: SELECT COUNT(*) FROM Employee WHERE attendance = 'present' AND department = 'Sales';

Q: "show employees with salary above 70000"
A: SELECT * FROM Employee WHERE salary > 70000;

NOW GENERATE SQL FOR:
Q: "${query}"
A:`;

    const res = await axios.post(`${ollamaUrl}/api/generate`, {
      model: 'llama3',
      prompt,
      stream: false,
    });

    const raw = res.data.response.trim();
    return raw.replace(/```sql|```/g, '').trim();
  }

  async generalAnswer(query: string): Promise<string> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    const res = await axios.post(`${ollamaUrl}/api/generate`, {
      model: 'llama3',
      prompt: `You are a helpful assistant. Answer the following question clearly and concisely in plain English.

Question: ${query}

Answer:`,
      stream: false,
    });
    return res.data.response.trim();
  }
}