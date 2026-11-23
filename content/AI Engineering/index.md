---
title: AI Engineering
description: "Learning AI engineering from zero - how LLMs work underneath, retrieval, agents and tool use, then running and evaluating them in production. Logged one week at a time."
tags:
  - ai-engineering
  - cs
---

Notes from learning **AI engineering**: building real software on top of large language models. I start as a complete beginner in machine learning, but with a backend engineer's toolbox (APIs, queues, Postgres, Kubernetes, tracing). The goal is to understand each idea from the inside, not just call an API, and to finish with a system that runs in production with measured answer quality.

The notes are a **weekly log**. Each week gets one page: what I studied, what clicked, what I built, where I got stuck, and whether I passed that week's checkpoint.

```text
Weeks  Phase                         Build
1      Python fluency                port a Go service to FastAPI
1-4    How LLMs work underneath      backprop + a small GPT
4-7    Open models and retrieval     RAG on Postgres + pgvector
7-11   Agents and tool use           an agent + an MCP server
11-15  Production and evaluation     the capstone
15-18  Polish and interviews         write-ups, demo
```

## Weekly notes

Start at [[AI Engineering/Weekly Notes/index|Weekly Notes]] for the full log, newest week at the top.

## The capstone

A document question-answering service that only a backend engineer would build: ingestion through Kafka, retrieval in Postgres, an agent layer, an automated evaluation suite and OpenTelemetry tracing, deployed on `ashfak.dev`.

---

_Later, this section grows into topic pages (Tokenization, Embeddings, RAG, Evals, ...) distilled from the weekly notes, in the same style as the [[Networking/index|Networking]] track._
