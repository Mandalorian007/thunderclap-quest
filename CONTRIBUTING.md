# Contributing to Thunderclap Quest

Thanks for your interest in contributing to Thunderclap Quest! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mandalorian007/thunderclap-quest.git
   cd thunderclap-quest
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start development environment:**
   ```bash
   pnpm dev
   ```

4. **Run tests:**
   ```bash
   pnpm test
   ```

## Project Structure

This is a Turborepo monorepo with three main applications:

- **`apps/convex/`** - Convex backend with database functions and business logic
- **`apps/discord-bot/`** - Discord.js bot application for slash commands
- **`apps/web/`** - Next.js web interface for enhanced features

## Code Standards

- **TypeScript**: All code should be properly typed
- **Testing**: New features should include tests
- **Documentation**: Update documentation for significant changes
- **Commits**: Use descriptive commit messages

## Feature Development

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the vertical slice architecture:**
   - Each feature should be self-contained in `apps/convex/convex/features/{feature}/`
   - Include types.ts, schema.ts, functions.ts, templates.ts, and index.ts
   - Add comprehensive tests

3. **Test your changes:**
   ```bash
   pnpm test
   pnpm type-check
   ```

4. **Submit a pull request:**
   - Describe the changes clearly
   - Include screenshots for UI changes
   - Ensure all tests pass

## Encounter Design Guidelines

When creating new encounters:

- **Be whimsical**: Embrace humor and unexpected situations
- **Meaningful choices**: Every option should lead to interesting outcomes
- **Balanced rewards**: Consider XP, titles, and potential loot
- **Consistent tone**: Match the existing blend of humor and RPG mechanics

## Getting Help

- Check the [documentation](docs/) for implementation guides
- Review existing encounters for patterns and conventions
- Open an issue for questions or clarification

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Have fun building something awesome!