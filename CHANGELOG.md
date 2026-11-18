# NULL//CITY changelog

## 0.1.0 - Milestone 1: Shell
- Four permanent tabs: NAV, INV, NET, PROFILE, each with its required sections.
- Cyberpunk theme (dark panels, cyan/magenta/red, monospace, scanlines).
- Module layout: state, persistence, ui, main.
- Local save of the active tab and section. NET is labeled as simulated.
- All tab content is a placeholder.

## 0.2.2 - Staged reveal
- The registration folder now opens first (tabs drop in, body unfolds), then each screen builds top to bottom: header, title, fields, buttons.
- Typing is faster on long text. The folder opening plays only on first entry, not on every step.

## 0.2.1 - Visual pass
- Typing animation for onboarding and placeholder text (tap to skip, off with reduced motion).
- Registration record restyled as a folder with step index tabs and a front pocket.
- Sleeker shell: icon tab bar, underline sub-nav, corner-accent panels, gradient edges, short fade transitions.

## 0.2.0 - Milestone 2: Identity registration
- First-login flow: local profile, identity, appearance, background choice, background introduction.
- Three backgrounds (Nomad, Corpo, Street Kid) with starting location, gear, contacts and reputation.
- PROFILE > Character: current operator record, reputation, personal history, and the immutable original identity record.
- Save format v2 (older saves upgrade automatically).
- Not yet: NAV tutorial, first mission, inventory screens (starting gear is stored but not shown in INV).

## 0.3.0 - Milestone 3: NAV tutorial and first contracts
- NAV shows your current location with a 3-step tutorial (skippable).
- One first contract per background (Nomad, Corpo, Street Kid): short branching scenes, no combat.
- Choices set credits, items, reputation and personal history; first completion logs FIRST CONTRACT COMPLETED.
- Save format v3 (existing characters get tutorial and mission progress automatically).
- Not yet: interactive map, travel, other locations, inventory screens to view reward items.

## 0.4.3 - Boot once per session
- The boot sequence now plays once per browser session instead of on every reload.

## 0.4.2 - Boot sequence
- Terminal-style start-up on every launch: local terminal, server link status (none, offline build), save check, module load bar, then operator name or registry. Tap to skip. Skipped with reduced motion.

## 0.4.1 - Side-by-side compare
- Comparing stored equipment against what is equipped now shows both items in two aligned columns, with colored stat differences.

## 0.4.0 - Milestone 4: Inventory (part 1)
- INV > Equipment: 10 slots (Accessories split into I and II), stat totals, slot-filtered storage, sort, inspect, compare, equip, unequip, scrap (with confirmation) into materials.
- INV > Items: categories with filter, 3 Quick Use slots, inspect. "Use" is disabled until health and combat exist.
- INV > Materials: quantity, rarity, source, crafting uses.
- Item database; background gear and mission rewards now use real items.
- Save format v4 (old item name lists convert automatically).
- Screens no longer replay their entrance animation on every tap.
- Not yet: Cyberware, equipment requirements (needs attributes), crafting, item use.

## 0.5.0 - Milestone 5: Attributes and leveling
- XP and levels (cap 30). Contracts award XP; each level grants exactly 3 attribute points.
- PROFILE > Attributes: six attributes with descriptions, upgrade costs (1, 2, then 3 points per step as values rise), staged +/- changes, a live preview of resulting stats, and a confirmation before spending.
- Backgrounds tilt starting attributes (small bonus only).
- Equipment requirements are enforced (the Surplus Vest needs Endurance 2).
- Level and XP shown in PROFILE > Character; every fifth level is logged in personal history.
- Save format v5 (existing characters get attributes and XP for contracts already completed).
- Resulting stats (HP, accuracy, capacity, and so on) are previews until combat and cyberware exist.

## 0.7.1 - Compact cyberware screen
- Shorter body stage, dimmer labels (only the selected region is highlighted), thin side meters with no badges, and one status line for load, stage and buffer.
- Region panel is now a list of one-line rows; descriptions, requirements, upgrade and remove appear only when a row is tapped. The clinic is collapsed unless the region is empty.
- Net effects collapse into a single line.

## 0.7.0 - Design pass: city map and cyberware screen
- NAV is now an interactive city map: nine districts, 27 locations, your position, mission markers, district details and free instant travel. Visiting a district reveals its hidden locations and logs the discovery in personal history.
- Contracts appear at the location where they are offered.
- Cyberware screen redesigned: centered body with slot groups on both sides, notched slot boxes, and side meters (load with a capacity marker, and the overload buffer). Selecting a region draws a line to its place on the body.
- Save format v7 (locations become ids; existing characters get a map).
- Layout ideas follow the reference screenshots; district names, shapes and art are original.

## 0.6.0 - Milestone 6: Cyberware
- INV > Cyberware: tappable 2D anatomical schematic with the 11 body regions (installed regions glow).
- Per-region panel: installed implants, upgrades (credits and materials), stored implants, and a temporary clinic to buy from.
- Cyberware capacity (from Technical) and psychosis tolerance (from Cool, plus some implants). Going over capacity is allowed after a confirmation and moves you through Strained, Unstable and Cyberpsychosis, each with stat penalties.
- First time you reach Cyberpsychosis is logged in personal history; your operator status reflects the stage.
- 14 implants including upgrade lines; some need Strength or Endurance.
- Attributes preview now includes implant effects, load and status.
- Save format v6.
- Not yet: combat episodes (loss of control), a real Medical District vendor, implant recovery or treatment.
