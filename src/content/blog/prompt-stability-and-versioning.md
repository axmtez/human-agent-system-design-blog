---
title: "Prompt Stability and Versioning"
description: "Treat prompts as code: version them, test them, and track which version produced which output."
author: "Jordan Lee"
publishDate: 2025-02-15
updatedDate: 2025-02-15

# Series & sequencing
series: null
seriesPart: null
seriesTotal: null

# Altitude (conceptual level)
altitude: "field-notes"

# Prerequisites — slugs of articles that should be read before this one
prerequisites: []

# Handoff — the slug of the next article in sequence
nextArticle: null
prevArticle: null

# Metadata
readingTime: 2
tags: ["system-design", "workflows", "design"]
draft: false
---

# Prompt Stability and Versioning

Prompts drift over time. Without versioning, you cannot reliably reproduce or debug behavior.

## Version prompts with the app

Store prompts in config or code, not only in the LLM provider UI. Tag them with a version or commit so each run can log which prompt was used.

## A/B and canary

When changing a prompt, run old and new in parallel for a subset of traffic. Compare outcomes (e.g. human corrections, task success) before full rollout.

## Regression tests

Define a small set of inputs and expected behavior. Run them on each prompt change to catch regressions before they reach users.
