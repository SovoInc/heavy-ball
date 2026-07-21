# Anti-Cheat Architecture

## Overview

The Heavy Ball server uses a multi-layered approach to prevent score manipulation. No single layer is sufficient on its own — they work together to make cheating impractical.

## Layer 1: Authentication

- Players authenticate via Midnight wallet. The server validates the wallet address format (`mn_shield-addr_` prefix, alphanumeric body, 40-200 chars).
- On wallet registration, the server issues a **Bearer auth token** (UUID) stored in the `auth_tokens` table.
- Auth tokens **expire after 30 days**. Expired tokens are pruned on server startup.
- All score-submitting endpoints require a valid Bearer token matching the player ID.

## Layer 2: JWT Game Sessions

Before a level starts, the client must request a session from the server:

```
POST /api/session/start  { player_id, level, ball_id, physics_version }
```

The server:
1. Verifies the player has completed the previous level (level progression gating).
2. Creates a session row in the `sessions` table (UUID primary key).
3. Returns a **JWT signed with `server_secret + wallet_address`** containing the session ID, player ID, level, immutable ball ID/physics version, and timestamps.

The JWT secret is randomly generated on each server restart, invalidating all prior session tokens.

### Why this matters

- An attacker cannot forge a session token without knowing both the server secret and the player's wallet address.
- Session tokens are bound to a specific player — they cannot be transferred.
- The `iat` (issued-at) claim establishes a wall-clock start time for plausibility checks.

## Layer 3: Client-Signed Score JWT

When submitting a score, the client does **not** send raw JSON. Instead:

1. The client constructs the score data (time, boxes broken, power-ups, etc.).
2. The client signs this data as a **JWT using the session token as the HMAC-SHA256 key**.
3. The client sends `{ session_token, score_token }` to the server.

The server:
1. Decodes `score_token` using `session_token` as the HMAC key — rejects if the signature is invalid.
2. Validates `session_token` using `server_secret + wallet_address` — rejects if forged or expired.
3. Cross-checks that player ID, level, ball ID, and physics version match between both tokens.

### Why this matters

- Tampering with any field in the score data invalidates the HMAC signature.
- The score data is cryptographically bound to the session that produced it.
- An attacker cannot mix-and-match sessions and scores.

## Layer 4: One-Time Session Use

Each session token can only be used **once**. The server tracks this in the database:

```sql
UPDATE sessions SET used = 1
WHERE id = ?1 AND player_id = ?2 AND level = ?3
  AND ball_id = ?4 AND physics_version = ?5 AND used = 0
```

If the session was already consumed, the submission is rejected. This prevents replay attacks.

## Layer 5: Score Validation

Even with a valid session and signature, the server enforces bounds on all submitted values:

| Field | Min | Max |
|-------|-----|-----|
| `level` | 1 | 100 |
| `time_ms` | 3,000 (3s) | 3,600,000 (1hr) |
| `boxes_broken` | 0 | 500 |
| `power_ups_collected` | 0 | 200 |
| `fall_count` | 0 | 1,000 |
| `speed_boosts` | 0 | 500 |

The server also checks that `time_ms` is plausible relative to the wall-clock time elapsed since the session started (with a 60-second tolerance for time bonus power-ups).

## Layer 6: Level Progression Gating

Players cannot start a session for level N without having a completed score for level N-1. This prevents skipping ahead to claim completion of all 100 levels.

## Layer 7: Rate Limiting

A per-IP rate limiter allows **300 requests per 60 seconds**. Beyond that, requests receive HTTP 429 with a `Retry-After` header. The rate limiter state is shared across all server worker threads.

## Attack Summary

| Attack | Prevention |
|--------|-----------|
| Submit fake scores via curl | Requires valid session JWT (can't forge without server secret + wallet) |
| Tamper with score data after signing | HMAC signature verification fails |
| Replay a previous submission | Session is marked as used in DB |
| Skip to level 100 | Level progression gating blocks session creation |
| Submit impossibly fast times | Score bounds + wall-clock plausibility check |
| Spam the API | Per-IP rate limiting |
| Forge session tokens | Signed with random server secret + wallet address |
| Use another player's session | JWT contains player ID, cross-checked against auth token |
| Use expired auth tokens | 30-day TTL enforced on validation |
