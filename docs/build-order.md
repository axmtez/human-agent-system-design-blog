# Three.js Airport Diorama — Build Order

**Project:** HAS-D Blog
**Milestone:** Three.js Airport Diorama
**Total Issues:** 47 (11 parents, 36 sub-issues)

---

## How to Use This Document

Each step below is a single work session. Complete every sub-issue in a step before moving to the next step. When working with a coding agent, feed it the parent issue description plus each sub-issue one at a time.

### Ticket workflow

**When you start a sub-issue:**

1. Open the sub-issue in Linear
2. Move status from **Backlog → In Progress**
3. Assign yourself if not already assigned

**When a sub-issue is done:**

1. Verify against the criteria listed in the issue description
2. Move status to **Done**
3. Add a comment to the issue noting what was built and any deviations from the spec (e.g., "Used 1024 shadow map instead of 2048 — looked identical, saved GPU budget")

**When all sub-issues in a parent are done:**

1. Run the parent issue's **Verify** check (listed in the parent description)
2. If it passes, move the parent to **Done**
3. If it fails, reopen the relevant sub-issue and fix it before closing the parent

**If you change something during a build:**

Update the sub-issue description with what actually shipped. These issues are the source of truth for what's in the codebase. Future you (or a coding agent) will read them to understand what exists.

---

## Step 1 — Environment

**Parent:** ILI-393 · Environment: Renderer, Camera, Lighting & Ground Plane
**Blocks:** Everything. Nothing else can start until this is approved.
**Test route:** `/dev/diorama/environment`

Build in this order:

1. **ILI-394 · Renderer configuration**
   WebGLRenderer setup, shadow maps, tone mapping, pixel ratio cap, resize listener.

2. **ILI-395 · Isometric camera setup**
   OrthographicCamera at (60, 60, 60), frustum from container aspect ratio. OrbitControls only in dev.

3. **ILI-396 · Lighting rig (ambient, directional, hemisphere)**
   Three-light setup. Ambient lifts shadows, directional casts them, hemisphere adds faint blue sky fill. Shadow map 2048×2048.

4. **ILI-397 · Ground plane with grid**
   120×120 plane at #0a0a0a, subtle #151515 grid overlay at y:0.01.

5. **ILI-398 · Dev test harness page**
   Reusable `initTestScene(canvas)` function. `/dev/diorama/environment` route gated behind `import.meta.env.DEV`. Stats.js, OrbitControls, scene info overlay.

**Verify:** Navigate to `/dev/diorama/environment`. See dark ground with grid, lit from upper-left, shadow visible on a temp cube. Orbit camera works. 60fps.

---

## Step 2 — Assets (parallel)

These five can be built in any order. They all depend only on the environment from Step 1. Each gets its own test route.

### 2A. Runway

**Parent:** ILI-399 · Asset: Runway
**Test route:** `/dev/diorama/runway`

1. **ILI-400 · Runway surface geometry**
   Two BoxGeometry strips in L-configuration. #1a1a1a material. receiveShadow.

2. **ILI-401 · Runway markings (centerline, threshold)**
   Small box meshes at y:0.06. Centerline dashes every 1.2 units. 4–6 threshold bars at each end. All children of the runway group.

**Verify:** Runway sits flush, shadows land on it, markings visible, L-config reads from isometric angle.

### 2B. Control Tower

**Parent:** ILI-402 · Asset: Control Tower
**Test route:** `/dev/diorama/tower`

1. **ILI-403 · Tower geometry (base, shaft, cab, antenna)**
   Stacked primitives in a Group. Base 3×1.2×3, shaft 1.2×2.5×1.2, cab 2.2×1.0×2.2, roof overhang, tapered antenna. Total ~5.5 units tall. Warm stone colors.

2. **ILI-404 · Tower cab window glow and interior light**
   Emissive plane panels on all four cab faces. PointLight at cab center, warm color, castShadow: false.

**Verify:** Tower stands, casts clean shadow, cab glows warm, proportions read at camera distance. Visual anchor.

### 2C. Aircraft

**Parent:** ILI-405 · Asset: Aircraft
**Test route:** `/dev/diorama/aircraft`

1. **ILI-406 · Aircraft geometry (fuselage, wings, tail, engines)**
   Factory function `createAircraft({ hullColor, accentColor })`. Tapered cylinder fuselage, box wings with sweep, tail fin takes accent color. Engine pods under wings.

2. **ILI-407 · Aircraft navigation lights**
   Red/green wingtip PointLights with emissive sphere markers. White tail beacon, nose light, red belly beacon. Store light refs in `userData`.

3. **ILI-408 · Livery configuration presets**
   Three presets: ALPHA (silver/blue), BRAVO (light/amber), CHARLIE (cool gray/green). Export as `LIVERIES` object. Test page shows all three side by side.

**Verify:** Silhouette reads as airplane at diorama scale. Three liveries are distinct. Nav lights visible. Shadows correct.

### 2D. Taxiways & Apron

**Parent:** ILI-409 · Asset: Taxiways & Apron
**Depends on:** Environment AND Runway (needs runway geometry to connect to)
**Test route:** `/dev/diorama/taxiways`

1. **ILI-410 · Taxiway strip geometry and markings**
   1.5-unit wide strips, #161616 material. Blue emissive edge lines (#4a9eff). Dashed amber centerline. 2–3 segments connecting runway to apron.

2. **ILI-411 · Apron and parking position markings**
   12×8 flat surface. 3–4 parking spots with lead-in lines, stop bars, T-markers.

**Verify:** Taxiways connect runway to apron. Blue edge lines visible from isometric camera. Scale consistent with runway.

### 2E. Holding Pattern Ring

**Parent:** ILI-412 · Asset: Holding Pattern Ring
**Test route:** `/dev/diorama/holding`

1. **ILI-413 · Holding ring geometry and material**
   TorusGeometry(6, 0.06, 8, 32), laid flat. Translucent blue #1a3a5a, emissiveIntensity 0.2, opacity 0.5. Try dashed LineDashedMaterial variant too — pick whichever reads better. No shadows.

**Verify:** Ring visible from isometric camera. Translucent, doesn't obscure geometry below. Subtle, not dominant.

---

## Step 3 — Scene Composition

**Parent:** ILI-414 · Scene Composition: Full Static Assembly
**Blocked by:** ALL assets from Step 2
**Test route:** `/dev/diorama/composed`

**Critical:** Every sub-issue must tag meshes with `sceneGroup` in `userData` during placement. The dim system in Step 5 depends on these tags.

1. **ILI-415 · Ground asset placement and tower positioning**
   Tower near center overlooking both runways. Primary runway along X-axis, secondary along Z-axis forming L. Taxiways connect to apron on the tower side. Tag all groups: `'tower'`, `'runway'`, `'taxiway'`, `'apron'`.

2. **ILI-416 · Aircraft instance placement (5 states)**
   Five aircraft from the factory:
   - Parked (ALPHA) — on apron
   - Taxiing (BRAVO) — on taxiway
   - Final approach (ALPHA) — y:2, aligned with primary runway
   - Holding (CHARLIE) — y:10, on the ring path
   - En route (BRAVO) — y:16, edge of scene
   Store refs in `scene.userData.aircraft`. Tag each with `sceneGroup: 'aircraft-[state]'`.

3. **ILI-439 · Holding ring and handoff line placement**
   Position ring above airport (suggested: 10, 10, -10). Store center and radius in `userData` for the orbit animation. Add invisible `THREE.Line` (opacity 0) for the Beat 4 handoff vector — endpoints from tower cab to approach aircraft position.

**Verify:** Full airport reads from isometric camera. Tower is the anchor. Aircraft are distributed across states. Spatial relationships make sense. Shadows correct. No overlap, no hidden elements.

---

## Step 4 — Ambient Animation

**Parent:** ILI-417 · Animation: Ambient (continuous loops)
**Blocked by:** Scene Composition (Step 3)
**Test route:** `/dev/diorama/ambient`

1. **ILI-418 · Aircraft beacon blink and nav light pulse**
   Belly beacon: sharp flash (100ms on / 1200ms off) via sine threshold. Phase offset per aircraft. Wingtip lights: gentle intensity oscillation. Use `clock.getElapsedTime()`.

2. **ILI-419 · Holding pattern aircraft orbit**
   Aircraft 4 follows a circular path at ring radius and altitude. ~21 seconds per revolution. Nose tangent to circle. Subtle constant bank angle.

3. **ILI-420 · Tower cab window glow oscillation**
   Two overlapping sine waves at different frequencies on the interior PointLight intensity (range 0.8–1.1). Match emissive intensity on window panel materials. Barely perceptible.

**Verify:** Scene feels alive at rest. Lights blink, holding aircraft orbits, tower glows. Nothing jarring. 60fps.

---

## Step 5 — Scroll-Driven Story Beats

**Parent:** ILI-421 · Animation: Scroll-Driven Story Beats
**Blocked by:** Ambient Animation (Step 4)
**Test route:** `/dev/diorama/scroll`

1. **ILI-422 · Scroll progress binding and canvas sticky layout**
   Sticky canvas at top (80vh). 500vh scroll track below. Progress = 0–1 from content panel scrollTop. Read in rAF loop. All state changes bidirectional.

2. **ILI-436 · Camera lerp system for story beat focus shifts**
   Interpolate `lookAt` target and orthographic `viewSize`. Each beat defines a target camera state. Beat's `t` (0–1) drives the lerp. No pop, no jitter.

3. **ILI-437 · Scene element dim/restore system for beat emphasis**
   Store original colors in `userData`. `dimMeshes(meshes, dimAmount, t)` interpolates toward #0a0a0a. Uses `sceneGroup` tags from composition. Pre-allocate Color objects. Fully reversible.

4. **ILI-438 · Handoff vector line geometry (Beat 4 visual)**
   Dashed line from tower cab to approach aircraft. Dynamic endpoints updated per frame. Opacity 0 by default, fades to 0.6 during Beat 4 only.

5. **ILI-423 · Story beat definitions (6 beats)**
   Wire it all together:
   - **0.00–0.15 THE AIRSPACE** — full scene, everything normal
   - **0.15–0.30 THE CONTROLLER** — camera focuses tower, tower brightens, others dim
   - **0.30–0.50 THE AIRCRAFT** — camera pulls back, approach aircraft descends
   - **0.50–0.65 THE HANDOFF** — camera frames tower↔aircraft gap, vector line fades in
   - **0.65–0.80 THE GUARDRAILS** — camera includes holding ring, ring pulses, orbiting aircraft prominent
   - **0.80–1.00 THIS IS HAS DESIGN** — camera returns to full scene, everything restores

**Verify:** Full scroll tells a coherent visual story. Transitions smooth. Scrolling backward reverses cleanly. No jumps.

---

## Step 6 — Labels

**Parent:** ILI-424 · Labels: HTML Overlay System
**Blocked by:** Scroll Story Beats (Step 5)
**Test route:** Same as `/dev/diorama/scroll`

1. **ILI-425 · Label rendering, styling, and positioning**
   Absolute-positioned HTML container over canvas (pointer-events: none, z-index: 10). One `div.beat-label` per beat with title (uppercase, vector blue, system font) and body (human font, secondary color). Position per beat to complement scene focus. Opacity controlled by `updateStoryBeat` — fade in at beat start, fade out at t > 0.85.

**Verify:** All 6 labels appear at correct scroll positions. Readable against dark scene. Don't obscure key scene element. Fade in/out smoothly. Reverse on scroll-back.

---

## Step 7 — Integration

**Parent:** ILI-426 · Integration: Mount Diorama on Blog Landing Page
**Blocked by:** Labels (Step 6)

1. **ILI-427 · Mount diorama in content panel and add entry point**
   Replace `#diorama-mount` placeholder in `/blog/index.astro`. Canvas + label container + scroll track + Foundations entry CTA. "BEGIN PART 1 →" for new readers, "CONTINUE → [Next Unread]" for returning readers via localStorage.

2. **ILI-428 · View Transition compatibility and cleanup**
   Listen for `astro:after-swap`, re-init diorama on return to `/blog`. Clean up previous WebGL context first. Test: landing → article → landing → article → landing. No crashes, no memory growth, no black canvas. Sidebar never re-renders.

3. **ILI-429 · Performance optimization and mobile fallback** (6 sub-issues):
   - **ILI-430** · Profile full scroll-through in DevTools
   - **ILI-431** · WebGL resource disposal and memory leak prevention
   - **ILI-432** · Throttle resize handler
   - **ILI-433** · Pause animation loop when landing page not visible
   - **ILI-434** · Shadow quality tuning
   - **ILI-435** · Mobile fallback strategy (sub-900px screens)

**Verify:** Diorama runs on the live blog landing page. View Transitions work. 60fps. No leaks. Mobile handled. Entry point links to correct article.

---

## Dependency Chain (Summary)

```
Environment (ILI-393)
    │
    ├── Runway (ILI-399)──────────────┐
    ├── Tower (ILI-402)───────────────┤
    ├── Aircraft (ILI-405)────────────┤
    ├── Taxiways (ILI-409) ←also Runway┤
    └── Holding Ring (ILI-412)────────┘
                                      │
                              Composition (ILI-414)
                                      │
                              Ambient Animation (ILI-417)
                                      │
                              Scroll Story Beats (ILI-421)
                                      │
                              Labels (ILI-424)
                                      │
                              Integration (ILI-426)
```

---

## Quick Reference: All Issue IDs

| ID | Title | Parent |
|---|---|---|
| ILI-393 | Environment: Renderer, Camera, Lighting & Ground Plane | — |
| ILI-394 | Renderer configuration | ILI-393 |
| ILI-395 | Isometric camera setup | ILI-393 |
| ILI-396 | Lighting rig | ILI-393 |
| ILI-397 | Ground plane with grid | ILI-393 |
| ILI-398 | Dev test harness page | ILI-393 |
| ILI-399 | Asset: Runway | — |
| ILI-400 | Runway surface geometry | ILI-399 |
| ILI-401 | Runway markings | ILI-399 |
| ILI-402 | Asset: Control Tower | — |
| ILI-403 | Tower geometry | ILI-402 |
| ILI-404 | Tower cab window glow | ILI-402 |
| ILI-405 | Asset: Aircraft | — |
| ILI-406 | Aircraft geometry | ILI-405 |
| ILI-407 | Navigation lights | ILI-405 |
| ILI-408 | Livery presets | ILI-405 |
| ILI-409 | Asset: Taxiways & Apron | — |
| ILI-410 | Taxiway strip geometry | ILI-409 |
| ILI-411 | Apron and parking | ILI-409 |
| ILI-412 | Asset: Holding Pattern Ring | — |
| ILI-413 | Ring geometry and material | ILI-412 |
| ILI-414 | Scene Composition | — |
| ILI-415 | Ground asset + tower placement | ILI-414 |
| ILI-416 | Aircraft instance placement | ILI-414 |
| ILI-439 | Holding ring + handoff line placement | ILI-414 |
| ILI-417 | Animation: Ambient | — |
| ILI-418 | Beacon blink + nav pulse | ILI-417 |
| ILI-419 | Holding pattern orbit | ILI-417 |
| ILI-420 | Tower cab glow oscillation | ILI-417 |
| ILI-421 | Animation: Scroll-Driven Story Beats | — |
| ILI-422 | Scroll progress binding | ILI-421 |
| ILI-436 | Camera lerp system | ILI-421 |
| ILI-437 | Scene dim/restore system | ILI-421 |
| ILI-438 | Handoff vector line (Beat 4) | ILI-421 |
| ILI-423 | Story beat definitions (6 beats) | ILI-421 |
| ILI-424 | Labels: HTML Overlay System | — |
| ILI-425 | Label rendering + positioning | ILI-424 |
| ILI-426 | Integration | — |
| ILI-427 | Mount diorama + entry point | ILI-426 |
| ILI-428 | View Transition compatibility | ILI-426 |
| ILI-429 | Performance + mobile fallback | ILI-426 |
| ILI-430 | DevTools profile | ILI-429 |
| ILI-431 | Resource disposal | ILI-429 |
| ILI-432 | Throttle resize | ILI-429 |
| ILI-433 | Pause animation loop | ILI-429 |
| ILI-434 | Shadow quality tuning | ILI-429 |
| ILI-435 | Mobile fallback | ILI-429 |