"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const sync_1 = require("csv-parse/sync");
const prisma = new client_1.PrismaClient();
async function main() {
    const file = fs.readFileSync('prisma/MOCK_DATA.csv', 'utf-8');
    const records = (0, sync_1.parse)(file, { columns: true, skip_empty_lines: true });
    const uniqueDepartments = [...new Set(records.map(r => r.department))];
    const departmentMap = {};
    for (const deptName of uniqueDepartments) {
        const dept = await prisma.department.create({
            data: {
                name: deptName,
                location: 'India',
                budget: 300000,
            },
        });
        departmentMap[deptName] = dept.id;
    }
    console.log(`Seeded ${uniqueDepartments.length} departments`);
    const managerMap = {};
    const seenManagers = new Set();
    for (const row of records) {
        if (!seenManagers.has(row.manager_name)) {
            seenManagers.add(row.manager_name);
            const manager = await prisma.manager.create({
                data: {
                    name: row.manager_name,
                    email: row.manager_email,
                    department_id: departmentMap[row.department],
                },
            });
            managerMap[row.manager_name] = manager.id;
        }
    }
    console.log(`Seeded ${seenManagers.size} managers`);
    for (const row of records) {
        const employee = await prisma.employee.create({
            data: {
                id: parseInt(row.id),
                name: row.name,
                gender: row.gender,
                email: row.email,
                department_id: departmentMap[row.department],
                manager_id: managerMap[row.manager_name],
            },
        });
        await prisma.attendance.create({
            data: {
                employee_id: employee.id,
                date: new Date(row.date + ' UTC'),
                status: row.attendance_status,
                shift_start_time: row.shift_start_time,
                shift_end_time: row.shift_end_time,
            },
        });
        await prisma.salaryRecord.create({
            data: {
                employee_id: employee.id,
                amount: parseFloat(row.salary),
                grade: parseFloat(row.salary) >= 80000 ? 'A' :
                    parseFloat(row.salary) >= 60000 ? 'B' :
                        parseFloat(row.salary) >= 40000 ? 'C' : 'D',
                effective_date: new Date(row.date + ' UTC'),
            },
        });
    }
    console.log('All 1000 employees seeded with attendance and salary!');
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map