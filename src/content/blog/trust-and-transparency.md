---
title: "Trust and Transparency"
description: "Helping users understand what the agent did and why, so they can trust and correct it."
author: "Chad Bercea"
publishDate: 2025-01-20
updatedDate: 2025-01-20

# Series & sequencing
series: null
seriesPart: null
seriesTotal: null

# Altitude (conceptual level)
altitude: "opinion"

# Prerequisites — slugs of articles that should be read before this one
prerequisites: []

# Handoff — the slug of the next article in sequence
nextArticle: null
prevArticle: null

# Metadata
readingTime: 3
tags: ["human-agent", "ux", "design"]
draft: false
---

# Trust and Transparency

Users who don’t understand the system won’t trust it. This post covers how to expose agent behavior without overwhelming.

## Explain the step

For each agent action, show a one-line summary: "Summarized the document", "Generated three options", "Checked policy X". Link to raw input/output for power users or auditors.

## Confidence and uncertainty

When the agent is unsure, say so. Use confidence scores, "low/medium/high", or explicit "I’m not sure" so the human knows when to double-check.

## Correction and feedback

Let users correct output and feed that back into the system (e.g. as examples or as a signal to retrain). Close the loop so the next run can be better.
