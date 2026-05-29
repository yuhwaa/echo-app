# Claude Integration & AI Workflow

This document describes how AI tools are used in the development of Echo.

## Primary Tools
- **Claude (Anthropic)** — primary AI collaborator for architecture decisions, 
component development, and debugging
- **Claude in VSCode** — in-editor assistance during active development

## How I Work with AI

### Architecture & Planning
I use Claude to think through feature architecture before writing code — 
discussing data flow, component structure, and tradeoffs. The goal is to 
understand the approach before implementing it, not just generate code blindly.

### Component Development
Claude assists with scaffolding components and suggesting patterns. I review, 
understand, and adapt all generated code before committing. If I can't explain 
a line of code, it doesn't ship.

### Debugging
When errors occur, I share the full context with Claude — error messages, 
relevant code, and what I've already tried. This collaborative debugging 
approach resolves issues faster while building my understanding of root causes.

### Code Review
I use Claude as a first-pass reviewer before opening PRs — checking for 
edge cases, accessibility issues, and code quality concerns.

## What AI Doesn't Replace
- Product decisions and feature prioritization (Jira board)
- Design judgment and visual taste
- Understanding why the code works, not just that it works
- Accessibility auditing and user empathy

## UI/UX Decision Making
I use Claude to pressure-test UI decisions and stay current with design 
patterns — for example, validating component interaction patterns or 
understanding current conventions before implementing (e.g. confirming 
hamburger menus are out of favor for simple nav in 2026, leading to a 
more appropriate avatar menu pattern). This replaces extensive independent 
research for decisions where established best practices exist, while keeping 
final design judgment with me.

## Example Workflow
1. Identify a feature need (e.g. auth-protected write actions)
2. Discuss architecture with Claude before writing any code
3. Scaffold implementation with AI assistance
4. Review, understand, and adapt the output
5. Test manually across authenticated and unauthenticated states
6. Use Claude for pre-PR code review
7. Commit with conventional commit messages

## Project Management
Echo is managed with a Jira board using standard Agile methodology:
- Features tracked as Stories with acceptance criteria
- Branch naming convention: `feature/TICKET-ID-description`
- Conventional commits: `feat`, `fix`, `docs`, `chore`
- Pull requests with descriptive summaries before merging to main