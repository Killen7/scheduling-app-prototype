---
name: swagger-supabase-compat
description: Implement Swagger-compatible Next.js API endpoints backed by Supabase for this scheduling app. Use when the user mentions swagger.json, TeamBuilderAPI endpoints, ABP routes, Supabase API integration, or asks to consume endpoints exactly as defined in the Swagger contract.
---

# Swagger + Supabase Compatibility

## Core Decision

This project should keep the external API contract compatible with `swagger.json`.

Do not replace Swagger routes with custom REST routes such as `/api/schedule` or `/api/locations` unless the user explicitly asks for a new contract. Implement the existing Swagger paths under Next.js App Router API route handlers and use Supabase internally as the backing data store.

## Architecture

Use this pattern:

```txt
UI / MCP / tests
  -> Next.js route handler matching swagger.json path
  -> server-only Supabase query or RPC
  -> response shaped like the Swagger DTO
```

Examples:

```txt
swagger: /api/app/office
next:    app/api/app/office/route.ts

swagger: /api/app/schedule/v2
next:    app/api/app/schedule/v2/route.ts

swagger: /api/app/recommendation/recommendations/{officeId}
next:    app/api/app/recommendation/recommendations/[officeId]/route.ts
```

## Implementation Rules

- Treat `swagger.json` as the public contract for route names, HTTP methods, query params, path params, response shapes, and error behavior.
- Use Supabase as persistence, not as the public API contract.
- Do not call Supabase directly from UI components when implementing Swagger-compatible behavior.
- Put Supabase access in route handlers or server-only service functions.
- Keep auth disabled for the current demo unless the user explicitly requests auth.
- Never expose service-role credentials to client components or browser code.
- Return JSON in the shape expected by the Swagger endpoint, even if Supabase table names or SQL shapes differ.
- For complex endpoints, prefer one Supabase SQL function/RPC or a server service function over spreading transformation logic across UI components.

## Recommended File Pattern

For each endpoint:

```txt
app/api/app/<resource>/route.ts
lib/api/<resource>-service.ts
```

Use the route handler for HTTP concerns:

- parse query/path/body params
- validate required inputs
- call the server service
- map errors to HTTP status codes
- return Swagger-compatible JSON

Use the service for Supabase concerns:

- query tables
- call RPC functions
- map database rows to DTOs

## Endpoint Selection

Do not implement the full Swagger file at once. Start with the smallest set needed by the UI/demo.

For the current scheduling UI, prioritize:

- `/api/app/office`
- `/api/app/personnel/staff-members`
- `/api/app/schedule/v2`
- `/api/app/recommendation/recommendations/{officeId}`
- shift-related endpoints only when creating, updating, or deleting shifts is needed

## Supabase Schema Guidance

The database schema can be simpler than the Swagger DTO model, but route responses must remain compatible with Swagger.

Expected backing concepts:

- offices or locations
- personnel
- shifts
- recommendations

Use views or RPC functions when a Swagger endpoint needs aggregated data that does not map cleanly to a single table.

## Working With `swagger.json`

Because `swagger.json` is large, do not read it all at once. Search specific endpoint paths or DTO names with ripgrep, then read narrow line ranges.

Useful searches:

```bash
rg '"/api/app/schedule/v2"' swagger.json
rg '"Schedule.*Dto"' swagger.json
rg '"/api/app/recommendation/recommendations/\\{officeId\\}"' swagger.json
```

After finding the path, inspect:

- HTTP method
- query/path/body parameters
- response schema `$ref`
- relevant DTO definition under `components.schemas`

## Route Handler Template

```ts
import { NextResponse } from 'next/server'
import { getScheduleV2 } from '@/lib/api/schedule-service'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const officeId = searchParams.get('officeId')

  if (!officeId) {
    return NextResponse.json({ error: { message: 'officeId is required' } }, { status: 400 })
  }

  const result = await getScheduleV2({ officeId, searchParams })
  return NextResponse.json(result)
}
```

## Important Constraints

- Keep code comments in English.
- Do not add auth until the user asks for it.
- Do not run `npm run dev` or `npm run build` unless the user asks.
- If database changes are needed, use Supabase MCP or SQL migrations deliberately and explain the demo security tradeoff.
