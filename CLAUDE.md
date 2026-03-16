# Heart Prevention App

## Project Overview

Heart Prevention is a cardiac wellness application that helps users track heart health through blood report analysis, biometric monitoring, and AI-powered lifestyle advice. This is a **wellness app, NOT a Software as a Medical Device (SaMD)**. It does not diagnose conditions or recommend medications.

## Tech Stack

- **Mobile**: Expo (React Native) with TypeScript
- **Web**: Next.js with TypeScript
- **Backend/API**: Next.js API routes
- **Database & Auth**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Anthropic Claude API for health insights
- **Monorepo**: Turborepo with npm workspaces

## Monorepo Structure

```
heart-prevention/
  apps/
    mobile/        # Expo React Native app
    web/           # Next.js web dashboard
    api/           # API service (Next.js API routes)
  packages/
    shared/        # Shared types, constants, utilities
    ui/            # Shared UI components
    supabase/      # Supabase client, types, migrations
```

## Package Relationships

- `apps/mobile` and `apps/web` depend on `packages/shared`, `packages/ui`
- `apps/api` depends on `packages/shared`, `packages/supabase`
- `packages/ui` depends on `packages/shared`
- `packages/supabase` depends on `packages/shared`

## Key Commands

```bash
# Development
turbo dev              # Start all apps in dev mode
turbo dev --filter=mobile  # Start only mobile app
turbo dev --filter=web     # Start only web app

# Build
turbo build            # Build all packages and apps

# Testing
turbo test             # Run all tests
turbo test --filter=api    # Run API tests only

# Linting
turbo lint             # Lint all packages

# Cleanup
turbo clean            # Remove build artifacts
```

## Regulatory Constraints

These rules apply to ALL code, prompts, and UI text in this project:

1. **No diagnosis**: Never state or imply that the app diagnoses any medical condition.
2. **No medication advice**: Never recommend, suggest, or reference specific medications or dosages.
3. **Disclaimers required**: Every AI-generated health insight must include a disclaimer such as "This is not medical advice. Consult your healthcare provider."
4. **Data sensitivity**: Blood report data and biometrics are personal health information. Always encrypt at rest, transmit over TLS, and follow least-privilege access.
5. **Wellness framing**: Use language like "wellness insights" and "lifestyle suggestions", not "treatment" or "prescription".
