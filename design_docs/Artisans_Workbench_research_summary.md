# Summary of Artisans_Workbench_research.md

This document is a comprehensive product requirements specification for a **modern issue tracker designed exclusively for individual software developers**, positioned as the "Artisan's Workbench." Here are the key points:

## Core Problem & Opportunity

**The "Collaboration Tax"**: Team-oriented tools (Jira, Asana, etc.) impose unnecessary complexity on solo developers with features like multi-user assignment, permission schemes, and team workflows. Conversely, personal task managers (Things, OmniFocus) lack developer-native integrations with Git, IDEs, and build pipelines.

**The Solution**: A "Personal IDE for Tasks" that merges Linear's developer-centric workflow with Things' focused personal organization philosophy—built for "single-player mode."

## Four Guiding Principles

1. **Frictionless Capture** - Zero-friction issue creation from anywhere
2. **Optimized for Flow State** - Sub-100ms interactions, keyboard-first design
3. **Context is King** - Deep bidirectional Git integration
4. **User Owns Their Data** - Complete data portability and export

## Core Features

**Issues**: Rich Markdown descriptions with syntax highlighting, customizable statuses, 4-level priority system, labels/tags, start/due dates, hierarchical sub-tasks, and dependency relationships (blocked by, blocking, related to).

**Organization**: Dual-hierarchy model with **Projects** (finite work) and **Areas** (ongoing responsibilities), plus smart views: Inbox, Today, Upcoming, and Logbook.

**Views**: List, Board (Kanban), and Calendar visualizations with advanced search using a JQL-inspired query language and saved filters.

**Workflow**: Fully customizable statuses and transitions, comprehensive keyboard shortcuts, and a Command Palette (`Cmd+K`) as the primary interface.

## Platform & Integrations

- **Native apps** for macOS (Swift), Windows (.NET MAUI), Linux, plus web and mobile (iOS/Android)
- **Git integration**: Automated branching, automatic PR/MR linking with keywords (`Fixes #123`), auto-close on merge
- **IDE extensions**: First-party VS Code extension (launch requirement), JetBrains suite follow-up
- **Public API**: REST/GraphQL with webhooks for third-party integrations

## Business Model

**Freemium subscription** with two tiers:
- **Free**: Unlimited issues/projects, all platforms, 1 VCS provider, standard API access
- **Pro** ($8/month annual): Unlimited VCS providers, webhooks, advanced automation, custom export templates, beta access

## Strategic Positioning

Positioned uniquely between Jira (enterprise teams), Linear (product teams), and Things (personal GTD)—combining professional developer tooling with personal productivity philosophy, targeting the solo developer/freelancer market segment.

## Conclusion

The document concludes that success depends on **relentless focus on the single-user experience**, treating the tool as an extension of the developer's mind rather than an administrative burden. Every design decision must serve to help one developer think more clearly, work more efficiently, and build better software.
