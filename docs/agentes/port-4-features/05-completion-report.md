## Decision Taken
Produced a detailed READ-ONLY implementation spec for porting 4 features from the HTML reference to the React KaitenMenu component.

## Files Changed
None (read-only analysis)

## Key Findings
1. [HIGH] Search feature requires new state (query, results, presentation mode) + 3 CSS presentation modes in globals.css (.search-static, .search-result-summary, .search-empty) — currently missing entirely
2. [HIGH] SVG plates replace emoji-only rendering — need plateSvg utility function + CSS for .plate-3d/.plate-face/.plate-shadow (already in globals.css partially but needs .plate-circle-wrap integration)
3. [HIGH] Belt step-snap replaces continuous CSS loop — conflicts with current x2 duplicate + translateX(-50%) approach; needs x3 items, measureBelt, beltFrontIndex, stepBelt, drag handling, prev/next buttons, keyboard on belt
4. [MEDIUM] Validation functions (validateProductData, sanitizeQuantity, validateSearchQuery) + shake keyframe — minimal conflict, additive only
5. [MEDIUM] Integration risk: current belt uses CSS animation (kaiten-belt-scroll) while reference uses RAF-driven transform with snap — cannot coexist; must replace belt animation system entirely

## Nuance
The belt system is the largest architectural change: the reference uses a requestAnimationFrame loop that manually positions items via transform:translateX(shift) with depth scaling (scale/opacity based on distance to center), while the current port uses a pure CSS infinite animation. This means the entire belt rendering + animation logic must be rewritten, not just extended. The search feature integrates with both views (wheel + belt) and requires a new "static grid" presentation mode for ≤5 results that disables the belt animation entirely. SVG plates are a drop-in replacement for the current emoji spans but require the plateSvg utility to generate the porcelain SVG markup with radial gradients.