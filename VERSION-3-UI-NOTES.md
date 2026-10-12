# Glossy Home v3 UI notes

## Premium dashboard
- Colourful responsive flat cards.
- Shows building/project, flat number/name, total/occupied/vacant rooms, expected rent, collected rent, rent balance, owner, and collection progress.
- Card click opens a detailed view with each room, tenant, rent, paid this month, room balance, plus Wi-Fi, ADDC, Agent Commission, Maintenance and total bill costs.

## Projects page
- Groups flats by the editable Building / Project Name.
- Building summary shows flat count, room count, total collection, expected collection, collection percentage, and costs.
- Flat sub-cards show owner, owner monthly cost/rent, tenant rent, collection and outstanding rent.

## Notes
- Existing data schema remains backward-compatible; metadata fields are optional.
- The source HTML does not contain actual building/owner assignments. Assign these values using Edit Flat. Do not guess which flat belongs to NMC Building or Ziyani Building.
- Current month bill values come from entries in Bills & Costs. Agent Commission is now available as a bill/cost type.
- This ZIP is code packaging only; it does not deploy the site or migrate device-local data.
