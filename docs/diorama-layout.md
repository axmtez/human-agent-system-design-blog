# Diorama — Spatial layout

Single source of truth for where each prop sits in the full composed scene. Animation loop only (no scroll).

All positions are in world space. Origin is ground level. **Y is up.** **Tower is central;** runway runs left–right; parking (ramp) between runway and tower.

---

## Current positions (from `composed.ts`)

| Prop | Position (x, y, z) | Notes |
|------|--------------------|--------|
| **Runway** | (0, 0, 0) | Two strips, 90° rotated (length along Z), on either side of center. Left at x=-10, right at x=+10; each length 30, width 3. |
| **Tower** | (0, 0, 4) | Central; +Z of runway |
| **Ramp** (taxiways group) | (0, 0, 2) | Parking “in between”; one slab at origin in group |
| **Plane A** | (0, 0, 2) initial | Driven by `updateLandingTakeoffLoop` (outgoing then incoming) |
| **Plane B** | (0, 0, 2) initial | Driven by `updateLandingTakeoffLoop` (incoming then outgoing) |

**Animation loop (24 s):** One plane flies in from off screen, lands on runway (right side), taxis to park. Meanwhile the other plane taxis from park to runway (left side), rolls, takes off before the end, flies off screen. Roles swap each half-loop. See `src/lib/diorama/landing-takeoff-loop.ts`.

---

## Layout plan (next steps)

1. **Decide framing**
   - What should the default / scroll beats camera see? (e.g. runway + tower + ramp in frame, aircraft spread so each beat has a clear subject.)
   - Optional: sketch or list “beat 1: this in frame; beat 2: this in frame” to drive positions.

2. **Tweak positions in code**
   - Edit `src/lib/diorama/composed.ts`: change `position.set(...)` and `rotation.y` (or other axes) for runway group, tower, taxiways group, each aircraft.
   - Keep this table in sync so we have one place to read “where things are.”

3. **Runway / Ramp relationship**
   - Runway at origin; ramp slab currently at (10, 0, -6) in group. Adjust so runway and ramp read clearly (e.g. ramp near tower, runway as main axis).

4. **Aircraft placement**
   - **Parked:** e.g. near ramp or tower.
   - **Taxiing:** on or near ramp/runway so it reads “moving on ground.”
   - **Approach:** in air, so handoff line from tower to this plane makes sense; handoff line endpoints in `composed.ts` should match tower cab and approach position.
   - **En route:** farther/higher so it reads “distant.”

5. **Handoff line**
   - After tower and approach positions are final: set line from tower cab (e.g. `tower.position + (0, cabHeight, 0)`) to `approach.position` in `composed.ts`.

6. **Verify**
   - Run full landing page and scroll beats; confirm no overlaps, clipping, or props off-screen when they should be visible.
   - Optional: use `/dev/diorama/props/` to sanity-check individual prop scale/orientation, then composed scene for overall layout.

---

## Grid demo routes

Tune each prop in isolation (same grid, one prop at a time):

- **Index:** `/dev/diorama/props/`
- **Per prop:** `/dev/diorama/props/runway`, `tower`, `taxiways`, `aircraft`, `aircraft-parked`, `aircraft-taxiing`, `aircraft-approach`, `aircraft-enroute`

---

## Layout revision workflow

1. **Per-prop tweaks:** Use grid demo pages to adjust scale, orientation, or look of each prop.
2. **Spatial layout:** Update the table above and the values in `composed.ts` so the full scene matches the layout plan. Key levers: tower position, runway origin, ramp position, aircraft positions, handoff line endpoints.
3. **Handoff line:** After tower and approach positions are final, set handoff line from tower cab to approach aircraft position.
