---
title: "Cost and Latency Tradeoffs"
description: "Balancing token cost, response time, and quality when designing agent-backed features."
author: "Chad Bercea"
publishDate: 2025-02-05
updatedDate: 2025-02-05

# Series & sequencing
series: null
seriesPart: null
seriesTotal: null

# Altitude (conceptual level)
altitude: "advanced"

# Prerequisites — slugs of articles that should be read before this one
prerequisites: []

# Handoff — the slug of the next article in sequence
nextArticle: null
prevArticle: null

# Metadata
readingTime: 2
tags: ["system-design", "observability"]
draft: false
---

# Cost and Latency Tradeoffs

Agents are not free and not instant. This post outlines how to make tradeoffs visible and configurable.

## Token budgets

Set per-request or per-session token limits. When approaching the limit, summarize or truncate context instead of failing late. Log usage for billing and tuning.

## Caching and reuse

Cache identical or near-identical prompts and reuse responses when safe. Invalidate on schema or prompt version changes. Reduces cost and often latency.

## Tiered quality

Offer a "fast" path (smaller model, shorter context) and a "thorough" path (larger model, more context). Let the user or the use case choose the tier.
