import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface EmployeeRow {
  employee_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  department: string;
  designation: string;
  manager_name: string;
  manager_id: string;
  manager_email: string;
  attendance: string;
  salary: string;
}

function parseSalary(raw: string): number {
  return parseFloat(raw.replace(/[$,\s]/g, ''));
}

async function main() {
  const file = fs.readFileSync(
    'prisma/data_nl2sql.csv',
    'utf-8'
  );

  const records = parse(file, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as EmployeeRow[];

  // Departments
  const uniqueDepts = [
    ...new Set(
      records
        .map(r => r.department)
        .filter(Boolean)
    ),
  ];

  const departmentMap = new Map<string, number>();

  for (const name of uniqueDepts) {
    const department = await prisma.department.create({
      data: {
        name,
        location: 'US',
        budget: 300000,
      },
    });

    departmentMap.set(name, department.id);
  }

  console.log(`Seeded ${uniqueDepts.length} departments`);

  // Managers
  const managerSet = new Set<string>();

  for (const row of records) {
    const departmentId = departmentMap.get(row.department);

    if (
      row.manager_id &&
      departmentId &&
      !managerSet.has(row.manager_id)
    ) {
      await prisma.manager.create({
        data: {
          id: row.manager_id,
          name: row.manager_name,
          email: row.manager_email,
          department_id: departmentId,
        },
      });

      managerSet.add(row.manager_id);
    }
  }

  console.log(`Seeded ${managerSet.size} managers`);

  // Employees + Attendance + Salary
  for (const row of records) {
    if (!row.employee_id) continue;

    const departmentId = departmentMap.get(
      row.department
    );

    if (!departmentId) continue;

    const salary = parseSalary(row.salary);

    const employee = await prisma.employee.create({
      data: {
        id: parseInt(row.employee_id),
        name: `${row.first_name} ${row.last_name}`.trim(),
        gender: row.gender,
        email: row.email,
        department_id: departmentId,
        manager_id: row.manager_id,
      },
    });

    await prisma.attendance.create({
      data: {
        employee_id: employee.id,
        date: new Date(),
        status: row.attendance,
        shift_start_time: '09:00',
        shift_end_time: '18:00',
      },
    });

    await prisma.salaryRecord.create({
      data: {
        employee_id: employee.id,
        amount: salary,
        effective_date: new Date(),
      },
    });
  }

  console.log('Seeded successfully!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });