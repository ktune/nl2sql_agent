# NL2SQL Agent

Natural Language to SQL Agent that converts plain English questions into SQL queries and returns database results.

## Tech Stack

* NestJS
* Prisma ORM
* MySQL
* Ollama (`llama3`)
* Docker

---

# Project Setup

## 1. Start Containers

```bash
docker-compose up --build -d
```

---

## 2. Pull Llama3 Model

```bash
docker exec -it nl2sql_ollama ollama pull llama3
```

---

## 3. Run Prisma Migration

```bash
docker exec -it nl2sql_backend npx prisma migrate dev --name init
```

---

## 4. Seed Database

```bash
docker exec -it nl2sql_backend npx ts-node prisma/seed.ts
```

---

## 5. Restart Backend

```bash
docker-compose restart backend
```

---

# API

Backend runs at:

```text
http://localhost:3000
```

---

# API Usage

## Endpoint

```http
POST /query
```

## Headers

```http
Content-Type: application/json
```

## Request Body

```json
{
  "query": "Show all absent employees"
}
```

---

# Testing with Postman

Use [Postman](https://www.postman.com?utm_source=chatgpt.com) to test the API.

### Steps

* Method: `POST`
* URL:

```text
http://localhost:3000/query
```

* Body → `raw` → `JSON`

Example:

```json
{
  "query": "Show top 5 highest paid employees"
}
```

---

# Response Types

## SQL Query Response

```json
{
  "type": "sql",
  "sql": "SELECT * FROM employees;",
  "answer": []
}
```

## General AI Response

```json
{
  "type": "general",
  "sql": null,
  "answer": "Machine learning is a field of AI..."
}
```

---

# Sample Queries

```json
{
  "query": "Show top 5 highest paid employees"
}
```

```json
{
  "query": "How many females were absent in Engineering?"
}
```

```json
{
  "query": "Show all employees with their department"
}
```

```json
{
  "query": "What is machine learning?"
}
```

---

# Environment Variables

| Variable       | Example                                  |
| -------------- | ---------------------------------------- |
| `DATABASE_URL` | `mysql://root:root@mysql:3306/nl2sql_db` |
| `OLLAMA_URL`   | `http://ollama:11434`                    |
| `OLLAMA_MODEL` | `llama3`                                 |

---

# Docker Services

| Service | Port    |
| ------- | ------- |
| Backend | `3000`  |
| MySQL   | `3307`  |
| Ollama  | `11434` |

---

# Features

* Convert natural language into SQL queries
* Execute generated SQL queries
* Handle attendance-related employee queries
* Support LIMIT-based queries like top 5 / top 10
* Return general AI responses for non-database questions
* Prisma ORM integration with MySQL
* Dockerized development setup
