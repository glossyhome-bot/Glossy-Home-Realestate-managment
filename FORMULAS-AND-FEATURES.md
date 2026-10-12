# Formulas and Features — derived from supplied HTML

This document describes formulas and behavior found in the supplied `property-rent-manager-backup.html`. The source HTML is preserved without code changes.

## Data storage

- Local storage key: `propertyRentManager_v1`
- Stored collections include flats, rooms nested under flats, tenants, payments, utilities, expenses, and available-property listings.
- Export JSON downloads the current in-memory database as `property-rent-manager-backup.json`.
- Import JSON parses a backup and replaces the current local data after confirmation.
- Reset returns to starter data (9 flats / 126 rooms) after confirmation. **Do not use Reset for the real-data device.**

## Financial / dashboard formulas

- Expected rent for a month: sum of `rent` for all tenants.
- Collected rent for a month: sum of payment `amount` where payment `month` equals the selected month.
- Pending rent: `max(0, expected rent - collected rent)`.
- Vacant room count: `max(0, total rooms across all flats - tenant count)`.
- Per-flat report expected rent: sum of rent for tenants assigned to that flat.
- Per-flat report rent paid: sum of that flat's tenants' payments for the selected month.
- Per-flat pending amount is calculated from expected rent less rent paid, clamped at zero.
- Per-flat cost totals are built from utilities/cost entries for the selected month; report rows include ADDC, Wi-Fi, maintenance and net (`rentPaid - costTotal`).
- Monthly report includes expected, paid, pending, costs, and net totals derived from the per-flat report data.

## Feature inventory visible in the supplied HTML

- Dashboard summary and per-flat summary
- Flats: add/edit/delete and room management
- Rooms: add/edit/delete and tenant assignment
- Tenants: add/edit/delete and room assignment
- Rent payments: record, list/filter by month/search, delete, export CSV
- Utilities/costs: add/edit/delete and report integration
- Monthly reports: display, download HTML report, print report
- Backup & Data: Export JSON, Import JSON, Reset starter data
- Available Now listings: add/edit/delete, photo preview/storage, share listing

## Important limitations from source

- The app explicitly states data is stored locally in the browser.
- Local browser storage does not provide automatic multi-device sync.
- The source has no secure server-side Admin ID/password protection demonstrated in the HTML.
- A browser-side login or hidden edit buttons alone would not secure edits; authentication must be enforced by the backend.
- The HTML's initial starter data is generated if local storage is empty. Do not confuse starter data with the real data currently on the user's phone.

## Formula verification note

This inventory is a reading of the supplied source, not a claim that formulas have been tested against real user data. Before cloud migration, use a copy of the JSON backup and compare totals between the old and new versions.


## Dashboard / Project Card calculations (v3)
- Flat expected rent = sum of monthly rent for tenants assigned to rooms in that flat.
- Flat collection = sum of payments for the current month for those assigned tenants.
- Rent collection % = collected / expected rent × 100, capped at 100%; if expected rent is zero, 0%.
- Rent balance = max(0, expected rent − collected).
- Bill cost = sum of recorded bill amounts for that flat and current month. Bill paid = sum of recorded paid amounts. Bill balance = max(0, cost − bill paid).
- Net balance after costs = collected rent − recorded bill cost. This is separate from rent balance and is not a full accounting profit calculation unless all costs are entered.
- Building totals are sums of the flats assigned to the same Building / Project Name. Unassigned records are not guessed into NMC Building or Ziyani Building.
