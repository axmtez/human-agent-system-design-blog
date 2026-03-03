---
title: "Context Windows and Memory"
description: "How to work within limited context and when to persist state across sessions."
author: "Chad Bercea"
publishDate: 2025-02-18
updatedDate: 2025-02-18

# Series & sequencing
series: "the-stack"
seriesPart: 2
seriesTotal: 4

# Altitude (conceptual level)
altitude: "patterns"

# Prerequisites — slugs of articles that should be read before this one
prerequisites: ["structured-outputs-and-schemas"]

# Handoff — the slug of the next article in sequence
nextArticle: "scaling-agent-workflows"
prevArticle: "structured-outputs-and-schemas"

# Metadata
readingTime: 2
tags: ["system-design", "human-agent", "workflows"]
draft: false
---

# Context Windows and Memory

Agents operate with bounded context. This post explores strategies for staying within limits while keeping the human's intent clear.

## Summarization and compression

Long conversations or documents can be summarized before being passed to the agent. Define rules for what gets compressed and what stays verbatim.

## External memory

When context is exhausted, persist key facts or decisions in a store the agent can query. Design a simple schema so retrieval stays predictable.

## Handoff summaries

When passing from one agent or human to another, include a short handoff summary: what was done, what's pending, and what the next step expects.
