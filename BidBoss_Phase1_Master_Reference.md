# BidBoss — Phase 1 Master Reference
## Combined from: Original Flowchart Doc (Doc A) + Phase 1 Functional Foundation (Doc B)
## Every section notes where each part came from.

---

## HOW TO READ THIS DOCUMENT

- **[DOC A]** = Original flowchart / sprint document (the older technical spec)
- **[DOC B]** = Phase 1 Functional Foundation (client's latest freeze document — supersedes conflicts)
- **[BOTH]** = Same in both documents
- **[DOC B OVERRIDES DOC A]** = Client changed this — use Doc B version only

---

---

# PART 1 — WHAT THE PRODUCT IS

**[BOTH]**

BidBoss is a weekly auction post-close operations system.

After an auction closes, BidBoss handles everything that happens next:
- Import the auction results
- Notify winning customers to choose Pickup or Shipping
- Prepare orders in the warehouse
- Let customers book pickup appointments
- Clerk checks in customers and hands off orders
- Track shipping orders simply
- Handle internal issues, exceptions, and returns

It is NOT a delivery fleet, GPS, or driver tracking platform in Phase 1.

---

---

# PART 2 — MODULES IN PHASE 1

**[DOC B — final confirmed list, overrides Doc A which included delivery modules]**

| Module | In App |
|---|---|
| Dashboard | ✅ |
| Auction Runs | ✅ |
| File Import | ✅ |
| Fulfillment Hub | ✅ |
| Slot Management | ✅ |
| Batch Notifications | ✅ |
| Inventory Clerk | ✅ |
| Shipping | ✅ |
| Issues / Returns | ✅ |

**Removed from Phase 1 (Doc B overrides Doc A):**
| Module | Decision |
|---|---|
| Delivery Assignment | ❌ Phase 2 |
| Delivery Fleet / Delivery Boy App | ❌ Phase 2 |
| Active Delivery | ❌ Phase 2 |
| Failed Delivery Report | ❌ Phase 2 |
| GPS / Route / Driver workflow | ❌ Phase 2 |

---

---

# PART 3 — ROLES

**[DOC B — refined from Doc A's role list]**

### Admin
Sees everything. Can:
- Import files
- Manage auction runs
- Manage slot settings
- Send notifications (batch and one-by-one)
- See all orders
- See all shipping
- See all issues and returns
- Override anything
- Print outputs

### Worker / Helper
**[DOC B]** — Worker sees only what helps with preparation:

Sees:
- Prep queue
- Opened order detail
- Source / storage location
- Final pickup location field
- Lot-level statuses
- Start / Complete preparation

Does NOT see:
- Finance
- Full customer communication logs
- Admin settings
- Issues table (unless later needed)

### Clerk / Check-in Desk
**[DOC B — important change from Doc A]**
Clerks ALSO prepare orders before doors open, then switch to check-in when pickup starts.

Clerk sees:
- Prep queue
- Opened prep order
- Order search
- Booking code
- Bidder number
- Customer name
- Authorized pickup person
- Release screen
- Print actions
- Case creation from release exceptions
- Return received

Clerk does NOT see:
- File import
- Admin settings

### Delivery Boy
**[DOC A only — removed from Phase 1 per Doc B]**
Delivery boy role moved entirely to Phase 2.

---

---

# PART 4 — DATA STRUCTURE

## 4.1 — Two Location Values Per Lot

**[BOTH — same concept, Doc B adds more clarity]**

Every lot must store TWO separate location fields. Never replace one with the other.

| Field | Name | Source | Purpose |
|---|---|---|---|
| 1 | Source / Storage Location | From ManyFastScan / catalog file. Read-only after import. | Where to FIND the item in storage during prep |
| 2 | Final Pickup Location | Assigned during preparation (BIN01–BIN50 or PU01–PU50) | Where to HAND OFF the item at release |

## 4.2 — Sort vs Non-Sort Classification

**[DOC A — auto-classification rule]**
- Storage location prefix = B → Sortable → assign to BIN (BIN01–BIN50)
- All other prefixes → Non-sortable → assign to PU (PU01–PU50)
- Mixed orders allowed (one order can have both BIN lots and PU lots)

**[DOC B — clarification]**
Sort vs non-sort is for preparation efficiency and queue sorting ONLY. It should not create unnecessary restrictions on workers.

## 4.3 — ManyFastScan Label Structure

**[DOC B]**
Each ManyFastScan label contains:
- Visible lot number (human-readable)
- ManyFastScan internal item ID (encoded in QR)
- Auction reference

System must store both: lot number + ManyFastScan internal item ID.

Scan support:
- Primary: scan by ManyFastScan internal item ID
- Fallback: manual lot number entry

## 4.4 — Order Status Fields

**[DOC A — original]** had two independent tracks:
- Fulfillment track: Not Prepared → Preparing → Prepared → Picked Up
- Customer track: Won → Booked → Checked-in → Picked Up → Abandoned

**[DOC B — overrides Doc A language]**
Use these words instead:

Fulfillment / Preparation statuses:
- Not Started (replaces "Not Prepared")
- In Progress (replaces "Preparing")
- Ready (replaces "Prepared")
- Ready + visible red flag/exclamation (replaces "Prepared with Exception" — do NOT use that phrase)

Customer statuses:
- Awaiting Choice (new — replaces "Won" for post-import state)
- Booked
- Checked In (replaces "Checked-in")
- Picked Up
- Shipping Selected (new)
- Cancelled (replaces "Abandoned")

Lot-level statuses (preparation):
- Pending
- Ready
- Not Found in Prep
- Hold / Issue

Case statuses:
- Open
- In Review
- Resolved
(Doc B simplified from 9 statuses in earlier versions to just 3)

## 4.5 — Customer Data Foundation

**[DOC B — new requirement]**
No full customer accounts needed in Phase 1, but structure must be future-ready:
- One clean customer record tied to bidder identity
- Secure tokenized customer links (unique per order)
- Minimal data shown to worker/helper
- Role-based data visibility
- Communication history stored properly
- Future-ready for: accounts, behavior analysis, retention, marketing

---

---

# PART 5 — FILE IMPORT

**[BOTH — same 3 files. Doc B clarifies field-matching approach]**

## 3 Source Files

| File | Contents | Required Fields |
|---|---|---|
| Catalog / Lot-Location File | Lot numbers and storage locations | Lot Number, Storage Location |
| Winning Results File | Who won what | Lot Number, Bidder Number, Winning Amount |
| Bidders File | Customer contact details | Bidder Number, Name, Phone, Email |

**[DOC B]**
- System must match by required fields, NOT by file names
- Registrations report is NOT part of Phase 1

## Import Flow

**[BOTH — same flow]**

1. Admin uploads all 3 files
2. System validates each file — checks required fields are present
3. Pre-import validation summary shown (what will be created, any errors)
4. Admin triggers import
5. System creates:
   - Customer records (upserted)
   - Orders (one per bidder)
   - Lots (one per lot won, linked to order)
   - Source locations saved to each lot (read-only)
   - Sort/non-sort classification applied automatically
   - Initial statuses set: Preparation = Not Started, Customer = Awaiting Choice
6. New Auction Run record is created containing everything

## Post-Import Screen — What Happens Immediately After

**[DOC B — critical requirement]**
Right after import succeeds, the SAME screen must show next actions clearly:

- Import stats: Orders Created, Lots Created, Customers Matched, Issues Flagged
- Next Step panel — prominent, not hidden elsewhere:
  - "Send Batch" — sends initial action link to ALL customers in one go
  - "Send One by One" — opens customer list, admin sends individually
  - "Skip for now" — small muted link (admin can go to Batch Notifications later)
- Secondary links:
  - "Open Auction Run →"
  - "View Orders →"

---

---

# PART 6 — AUCTION RUNS

**[DOC B — new module, not clearly defined in Doc A]**

Each Auction Run is the weekly operating record for one auction cycle.

Created automatically when import succeeds.

Each run contains:
- Auction number
- Auction title
- Imported date
- Active / Archived status
- All orders for that week
- All bookings
- All notifications / communications sent
- All shipping records
- All issues and returns

Top-right button on Auction Runs page: **"Import New Auction"**

Each run card shows:
- Run ID (e.g. RUN-031)
- Auction number + title
- Imported date
- Status: Active / Archived
- Mini stats: Total Orders, Ready count, Customers Booked, Shipping in Queue, Open Cases
- Status flags: Pickup Window (Open/Closed), Shipping Window (Open/Closed), Batch Notification (Sent/Pending/Not Started)

Opened Auction Run shows tabs:
- Orders
- Bookings
- Notifications
- Shipping
- Issues

---

---

# PART 7 — FULFILLMENT HUB (PREPARATION)

## 7.1 — Prep Queue

**[DOC A — queue sorting logic]**
Default sort: appointment time first, then rack/source location ascending.

**[DOC B — additional filter options confirmed]**
Filter and sort options:
- Appointment priority (default)
- Source location / rack order
- Total lot count high to low / low to high
- Largest non-sort first
- Largest sort first
- Sort only
- Non-sort only
- Mixed
- Walk-in priority override (clerk can bump any order to top)

Each order card shows:
- Bidder number (bold, large — primary identifier)
- Customer name (muted, smaller)
- Fulfillment status badge
- Appointment time chip (or "WALK-IN" red pill)
- Auction name (muted)
- Total lots / Non-sort count / Sort count
- Source location range (e.g. "Storage: A2 – B06")
- "Open Order →" button

**[DOC B — new indicator]**
If customer has checked in (Customer Status = Checked In):
Show a separate "Checked In ✓" green badge on the card.
This is an ARRIVAL indicator only — separate from preparation status.
Both can coexist: order can be "In Progress" AND show "Checked In ✓".

**[DOC A — no hard order lock]**
Multiple workers can open the same order. Designed for split handling (one worker on non-sort, another on sort).

## 7.2 — Inside an Opened Order

**[DOC A — original lot order]** Non-sort lots shown first, sort lots after.

**[DOC B — overrides Doc A]**
Default lot order inside an order: **source location ascending** (A1, A2, A3, B1, B2, B3, X01, X02, X03).
This is how workers physically move through the warehouse.

Each lot row shows:
- Lot number (bold)
- Item description (muted)
- Source / Storage Location chip (read-only — where to find in storage)
- Final Pickup Location input field (BIN01–BIN50 or PU01–PU50)
- Scan icon button (camera — scans ManyFastScan QR or location barcode)
- Lot-level status dot: Pending / Ready / Not Found in Prep / Hold / Issue

## 7.3 — Preparation Button Logic

**[DOC B — specific wording confirmed by client]**

Three button states with exact wording:
- **"Start Preparation"** — shown when order is Not Started. Tap sets status to In Progress, saves worker/clerk name + start timestamp.
- **"Continue Preparation"** — shown when order is already In Progress (worker returning to it)
- **"Complete Preparation"** — shown at bottom sticky bar when in progress

## 7.4 — Assignment Methods

**[DOC B — both methods required]**

1. **Bulk Assign** — select multiple lots → assign all to one BIN or PU in one tap
   - Useful for: same-location lots, non-sort staging on rolling rack
   - Checkbox per lot + Select All checkbox in header
   - Bulk action bar appears at bottom when lots selected

2. **One-by-One Assign** — individual lot assignment
   - Useful for: mixed orders, corrections, exceptions

**[DOC A]** Scan by camera is assistive — manual input always available as fallback.

## 7.5 — Completion Logic

**[DOC B — replaces Doc A's auto-complete logic]**

Doc A had: status auto-moves to Prepared when all lots have pickup locations.
Doc B changes: worker explicitly taps "Complete Preparation".

When "Complete Preparation" is tapped:

Case 1 — All lots assigned:
- Status → Ready
- Worker name + timestamp saved
- Auto notification fires: "Ready for pickup" (Notification #3)

Case 2 — Some lots flagged (Not Found / Hold / Issue), rest assigned:
- Status → Ready
- Red flag / exclamation mark shown on order card (NOT a separate status)
- Cases auto-created for flagged lots
- Confirmation modal: "X lot(s) are flagged. Order will be marked Ready with a flag. Cases created. Confirm?"

Case 3 — Any lot still untouched (no location, no flag):
- Completion BLOCKED
- Popup lists untouched lots
- Per untouched lot: "Assign Location" or "Mark as Issue" buttons
- Cannot complete until every lot is either assigned or explicitly flagged

## 7.6 — Missing Lot Logic During Prep

**[DOC B]**

If a lot cannot be found during preparation:
- Worker marks lot as "Not Found in Prep"
- System auto-creates or updates an internal case for that lot
- Worker continues preparing the rest of the order
- Order can still complete as Ready (with flag)

If missing lot is found later:
- Staff reopens the order (no hard lock — always reopenable)
- Taps "Mark as Found — Assign Location"
- Assigns final pickup location
- System updates the related case automatically

## 7.7 — Print: Order Preparation Slip

**[DOC B — new requirement, not in Doc A]**

Purpose: manual backup for workers/clerks in case of no mobile access or emergency.
Sent to check-in desk receipt printer (80mm thermal).

Content:
```
BIDBOSS — PREPARATION SLIP
Auction: [Number]
Bidder: [Bidder Number]   ← highly visible
Customer: [Name]
Status: [Not Started / In Progress / Ready]
Booking Code: [Code or "Not yet booked"]

LOTS — Source Location Order:
[Source Loc]  Lot [#] — [Item Description]
[Source Loc]  Lot [#] — [Item Description]
...

Prepared by: [Name]
[Date] [Time]
```

---

---

# PART 8 — SLOT MANAGEMENT

**[DOC B — confirmed with additions]**

Customers self-book via their unique portal link.
Admin and clerk can ALSO manually book or reschedule (important — not just customer self-serve).

## Slot settings must support:
- Copy last auction's slot setup (one-click copy with confirmation)
- Dates
- Time ranges
- Slot increments (10 / 15 / 20 / 30 min)
- Break windows (e.g. lunch break — no appointments during)
- Max appointments per slot (capacity gate)
- Add / Edit / Delete individual slots

## Reschedule rule (customer):
- Customers can reschedule up to 2 hours before appointment via same link
- Admin override: always exists, ignores 2-hour cutoff
- Clerk override: same as admin

## Important customer-facing note (show in portal):
"Please make sure to either reschedule or come on time. Slots are limited."

---

---

# PART 9 — CUSTOMER PORTAL

**[DOC B — confirmed portal content]**

Accessed via unique secure tokenized link per order.
Works on mobile. No sidebar. Clean centered layout.

Portal must show:
- Customer name
- Auction number
- Won lots (expandable list with lot # + item description)
- Current order status (using customer status language)
- Booking code / reference (prominent)
- Pickup option (book / reschedule slot)
- Shipping option
- Booked slot details if already booked
- Same link for reschedule (within 2-hour rule)
- Optional authorized pickup person name and phone

**[DOC B — no customer self-check-in in Phase 1]**
Clerk handles check-in at the desk. Customer does not check themselves in.

## Pickup choice:
- Customer sees available slots and books
- Can reschedule up to 2 hours before via same link
- Admin / clerk can always override

## Shipping choice:
- Once Shipping is selected online, CANNOT be changed back to Pickup online
- Admin can still override manually
- Same link usable after shipping selection to view shipping status

## Important notes shown to customer in portal:
- "Once shipping is selected, it cannot be changed back to pickup through this portal."
- "Appointment can be rescheduled up to 2 hours before."
- "Please either reschedule or arrive on time. Slots are limited."

---

---

# PART 10 — INVENTORY CLERK (CHECK-IN AND RELEASE)

## 10.1 — Check-in Search

**[DOC A]** Search by customer name or bidder number.
**[DOC B — adds]** Also search by booking code.

Single large search bar. No unnecessary filter tabs.

Results show: Bidder # (large, primary), Customer name, Auction #, Booking Code, Appointment time, Status badges, "Open Release" button.

Walk-in Override button (prominent):
- Clerk bumps order to top of prep queue
- Confirmation modal required

## 10.2 — Order Release Screen

**[DOC B — full confirmed spec]**

Shows:
- Customer name (large)
- Bidder number (large, prominent — primary identifier)
- Booking code (mono font)
- Auction number + appointment time
- **Authorized Pickup Person** — shown in amber info box if entered, or "None on file" if not
- Fulfillment Status badge + Customer Status badge (independent, side by side)
- **Issue flag** — red exclamation box if order has flagged lots: "This order has [X] flagged lot(s). Review before completing release."
- Checked in by: clerk name + timestamp (auto-filled)

Action buttons:
- **"Print Pickup Summary"** — sends to check-in desk receipt printer
- **"Request Helper"** — internal alert for bulky/mixed orders: "Helper request sent. Support will bring order to pickup area."

## 10.3 — Default Release Flow

**[DOC B — overrides Doc A's one-by-one approach]**

Doc A: clerk clicks each lot one by one.
Doc B: **Select All → deselect exceptions** is the standard.

Why: In practice, labels on bagged/wrapped items may not scan cleanly. Select All is faster and safer.

Flow:
1. All lots are selected (checked) by default
2. Clerk physically hands out items
3. Clerk unchecks any lot NOT handed out
4. If any lots unchecked → "Review Withheld Lots →" button appears
5. Clerk assigns reason per withheld lot
6. Complete release

Reasons for withheld lots:
- Not Found
- Customer Refused
- Issue
- Other

Optional scan support exists as secondary method (scan to deselect) but is NOT the primary method.

## 10.4 — Withheld Lots / Partial Release

**[BOTH — same concept, Doc B clarifies]**

Each withheld lot needs a reason before completion.
If "Issue" or "Other": optional notes field appears.

On confirm:
- Released lots: Customer Status → Picked Up
- Withheld lots: system auto-creates or updates internal case in Issues/Returns
- Pickup confirmation fires for released lots (#10)
- If Grade A or B lots released: 24-hour warranty note included in notification
- If no open case on order: Google Review request fires (#12)

## 10.5 — Print: Order Release Confirmation Slip

**[DOC B — refined from earlier versions]**

Sent to check-in desk receipt printer (80mm thermal).

Content:
```
BIDBOSS — RELEASE CONFIRMATION
Auction: [Number]
Bidder: [Bidder Number]   ← highly visible
Customer: [Name]
Appt: [Day] [Date] [Time]
Booking Code: [Code]
Authorized Pickup: [Name — Phone / None]

PICKUP LOCATIONS:
BIN01: Lots 594, 669, 1321
PU04: Lots 9, 34, 234, 290
PU07: Lots 14, 56

[!] ISSUE LOTS: Lots 102, 78 — See case

Released by: [Clerk Name]
[Date] [Time]
```

---

---

# PART 11 — SHIPPING

**[DOC B — simple 3-status flow, overrides any complex delivery logic from Doc A]**

## 3 Statuses Only

- In Queue for Preparation
- Prepared for Shipping
- Dispatched

## Operational Flow

1. Customer selects Shipping via portal link (or staff marks order as Shipping)
2. Order routes to Shipping module, excluded from pickup flow
3. Staff prepares the order
4. Staff marks order as "Prepared for Shipping"
5. Auto notification fires to customer: invoice + shipping update will follow (Notification #3 shipping variant)
6. Payment and invoice handled OUTSIDE the app in AuctionFlex360
7. Staff receives tracking number (from courier / shipping provider)
8. Staff pastes tracking number into the app
9. Staff sends tracking notification (one-by-one or batch) → Notification #13
10. Order becomes Dispatched

No customer-facing "preparing" update needed.
No accounting or payment automation in Phase 1.
No complex shipping carrier integration.

---

---

# PART 12 — BATCH NOTIFICATIONS

**[DOC B — 13 confirmed notifications, with template text]**

All 13 transactional notifications:

| # | Name | Trigger | Auto or Manual |
|---|---|---|---|
| 1 | Initial Action Link | After import | Manual (batch or one-by-one) |
| 2 | Shipping Selected Confirmation | Customer selects shipping | Auto |
| 3 | Ready for Pickup / Choose Action | Order status → Ready | Auto |
| 4 | Pickup Booking Confirmation | Customer books slot | Auto |
| 5 | Appointment Reminder | Day before appointment | Auto |
| 6 | One-Hour Arrival Reminder | 1 hour before appointment | Auto |
| 7 | Daily Reminder (no choice made) | Every day until choice made | Auto |
| 8 | Final Saturday Morning Reminder | Saturday morning of pickup week | Auto |
| 9 | Saturday 3 PM Cancellation Notice | Saturday 3 PM deadline | Auto |
| 10 | Pickup Confirmation | Release completed by clerk | Auto |
| 11 | Return Received Confirmation | Return intake completed | Auto |
| 12 | Google Review Request | After pickup if NO open case | Auto (conditional) |
| 13 | Tracking Notification | Staff pastes tracking number | Manual (batch or one-by-one) |

**Separate (not transactional):**
Weekly Catalogue Reminder — marketing batch campaign, isolated from the 13 above.

## Template Text (confirmed by client — Doc B)

**#1 — Initial Action Link:**
"Congratulations on your winnings from Bid Boss Auction #[Auction Number]. Please use your link to choose Pickup or Shipping: [Link]"

**#2 — Shipping Selected:**
"Your order has been marked for shipping. Once your order is ready, you will receive your invoice / shipping update shortly. Please note that once shipping is selected, this choice cannot later be changed back to pickup online."

**#3 — Ready for Pickup:**
"Your order is now ready. If not already booked, please use your link to choose a pickup time or select shipping."

**#4 — Booking Confirmation:**
"Your pickup is confirmed for [Date] at [Time]. Booking code: [Code]. Use the same link to reschedule up to 2 hours before your appointment."

**#5 — Appointment Reminder:**
"Reminder: your Bid Boss pickup is scheduled for [Date] at [Time]. Booking code: [Code]. If needed, use your link to reschedule up to 2 hours before."

**#6 — One-Hour Reminder:**
"Your pickup window begins in 1 hour. Booking code: [Code]. Entrance is at the back through the side bay door."

**#7 — Daily Reminder:**
"Please use your link to choose Pickup or Shipping for your order: [Link]"

**#8 — Final Saturday Reminder:**
"Final reminder: your order must be scheduled for pickup or marked for shipping today before the deadline. Link: [Link]"

**#9 — Cancellation Notice:**
"Your order has been cancelled due to no pickup / no shipping action before the deadline. If you have already communicated with us and this needs review, please contact support. Otherwise, repeated similar behavior may result in loss of bidding privileges."

**#10 — Pickup Confirmation:**
"This confirms your order was picked up on [Date] at [Time]. For eligible Grade A and Grade B lots, any functionality issue must be reported within 24 hours from the time this message was sent to support@bidbossinc.ca."

**#11 — Return Received:**
"Hello, this confirms that Lot #[Lot Number] from Auction #[Auction Number] has been received back by Bid Boss. Your case is now under review. Please allow time for assessment. Repeated follow-ups will not expedite the process. Thank you for your patience."

**#12 — Review Request:**
"Thank you for choosing Bid Boss. If everything went well, we would sincerely appreciate a quick Google review: [Review Link]"

**#13 — Tracking:**
"Your order from Bid Boss Auction #[Auction Number] has been shipped. Tracking number: [Tracking Number]"

---

---

# PART 13 — ISSUES / RETURNS

**[DOC B — most important new addition. Not well defined in Doc A.]**

## Case Structure

One case = one or more lot lines.
(Not one ticket per lot. Not one vague order-level note.)

## Case Header Fields
- Case number
- Auction number
- Order ID
- Bidder number
- Customer name
- Case type
- Case status
- Created by
- Created at
- Updated at

## Case Line Fields (per lot in a case)
- Lot number
- Issue reason
- Line status
- Notes
- Resolution

## Case Statuses (simplified per Doc B)
- Open
- In Review
- Resolved

## When Cases Are Created
- Prep screen: lot marked Not Found in Prep or Hold/Issue → auto-create case
- Release screen: lot deselected (withheld) → auto-create or update case
- Return intake: item brought back → create or update case
- Admin manually creates case

## Return Intake Flow

If customer brings back a previously picked-up item:

1. Staff searches by lot number, bidder #, order ID, or customer name — OR scans ManyFastScan QR
2. System checks: does an open case exist for this lot?
   - If YES: option to receive against existing case (recommended) or create new
   - If NO: create new return case
3. Staff fills:
   - Return reason: Customer Refused / Functionality Issue / Wrong Item / Other
   - Condition on return: As Sold / Damaged / Missing Parts / Other
   - Notes (optional)
4. "Mark as Return Received"
5. Auto notification #11 fires to customer
6. Print Return Receipt option appears

Return Receipt content:
```
BIDBOSS — RETURN RECEIPT
Auction: [Number]
Bidder: [Bidder Number]
Customer: [Name]
Lot: [Number] — [Description]
Condition: [Condition]
Reason: [Reason]
Received by: [Staff Name]
Date/Time: [Timestamp]
Case #: [Case Number]
Item is under review.
```

---

---

# PART 14 — CANCELLATION / FORFEITURE LOGIC

**[DOC B — new, not in Doc A]**

At the Saturday 3 PM deadline (or whenever admin triggers):
- Customer Status → **Cancelled**
- **Cancellation Reason** field required:
  - No response before deadline
  - Missed deadline
  - Admin hold
  - Customer communicated / override

**Do NOT delete or hide cancelled orders.**

**Manual rebook rule:**
If customer communicated properly, clerk/admin can manually rebook.
This resets status from Cancelled back to Booked.

**If order stays cancelled:**
Physical items flagged for retag/relist queue for next auction.
(Phase 1: manual flag only — no automated retag flow.)

---

---

# PART 15 — SPRINT / BUILD STRUCTURE

**[DOC A — sprint plan. Adjusted below for Phase 1 modules per Doc B]**

Doc A had 7 modules including delivery. Since delivery is Phase 2, sprint plan adjusts:

## Revised Sprint Plan

### Sprint 1 — Weeks 1-2 — Foundation
**[DOC A]**
- Database schema design
- Auth + roles (Admin, Worker, Clerk — Delivery Boy moved to Phase 2)
- File upload UI
- Import engine (3-file validation + field matching)
- Auction Run creation on import

### Sprint 2 — Weeks 3-4 — Warehouse + Booking (parallel)
**[DOC A with Doc B modifications]**

Track A — Preparation workflow:
- Prep queue (sort/filter options)
- Order detail (source location ascending lot order)
- BIN/PU assignment (bulk + one-by-one)
- Lot statuses (Pending / Ready / Not Found in Prep / Hold / Issue)
- Start / Continue / Complete Preparation buttons
- ManyFastScan QR scan support
- Missing lot → auto-case creation

Track B — Customer portal + booking:
- Unique tokenized customer links
- Portal: name, auction, lots, order status, booking code, Pickup or Shipping choice
- Slot selection + capacity gate
- Booking confirmation notification (#4)
- Reschedule within 2-hour rule
- Authorized pickup person field

### Sprint 3 — Weeks 5-6 — Clerk + Shipping + Notifications
**[DOC B additions]**

Track A — Inventory Clerk:
- Check-in search (name / bidder # / booking code)
- Order release screen (Select All → deselect flow)
- Partial release with reason
- Walk-in override
- Request Helper action
- Print: Preparation Slip + Release Confirmation Slip
- Auto-case creation from withheld lots

Track B — Shipping:
- Shipping queue (In Queue / Prepared for Shipping / Dispatched)
- Tracking number paste + send notification
- Batch tracking send

Track C — Batch Notifications:
- All 13 notification types
- Template editor with variable placeholders
- Automated triggers (daily reminder, Saturday reminders, ready-for-pickup)
- Notification log

### Sprint 4 — Weeks 7-8 — Issues/Returns + Dashboard + Buffer
**[DOC B new modules]**

- Issues/Returns module (cases, case lines, case statuses)
- Return intake flow + Return Receipt print
- Cancellation/forfeiture logic
- Dashboard (stats, lifecycle, feed, appointments)
- Auction Runs tab
- Slot Management (settings + copy from last auction)

### Sprint 5-6 — Weeks 9-12 — QA, UAT, Go-Live
**[DOC A]**
- Integration QA
- UAT with warehouse team
- Fixes
- Go-live

---

---

# PART 16 — WHAT CLIENT NEEDS TO PROVIDE

**[DOC B]**

| Item | Status |
|---|---|
| Transactional SMS provider | TBD — likely Twilio |
| Transactional email provider | TBD — likely SendGrid |
| Receipt / thermal printer model | At check-in desk — confirm model |
| Google Review link | TBD |
| Support email | Confirmed: support@bidbossinc.ca |
| Pickup entrance note | Confirmed: "Entrance is at the back through the side bay door." |
| Warranty grade logic | Confirmed: Grade A + B — 24-hour functionality window |
| AuctionFlex360 integration | Out of scope Phase 1 |
| Source file column names | TBD — client to confirm exact column names in each file |
| ManyFastScan QR encoding format | TBD — confirm what internal item ID looks like |

---

---

# PART 17 — DEFINITION OF DONE

**[DOC B — final confirmed checklist]**

Phase 1 is complete only when ALL of the following work in a real Bid Boss operation:

**Import and Setup:**
- [ ] 3 files can be uploaded and validated by required fields (not file names)
- [ ] Auction Run created correctly from import
- [ ] Orders and lots created with both source and final pickup locations preserved
- [ ] Post-import screen shows next actions immediately (Send Batch, Send One by One, Open Auction Run, View Orders)

**Preparation:**
- [ ] Workers and clerks can prepare on mobile — fast and smooth
- [ ] Lots sorted by source location ascending inside orders
- [ ] Bulk and one-by-one assignment both work
- [ ] ManyFastScan QR scan works (internal item ID) with manual fallback
- [ ] Start Preparation / Continue Preparation / Complete Preparation flow works correctly
- [ ] Missing lots do not block the whole order — must be explicitly flagged
- [ ] Ready + flag shows correctly when issue lots exist
- [ ] Missing lot found later → reopen, assign, update case

**Customer Flow:**
- [ ] Customers receive unique link after batch send
- [ ] Portal shows: name, auction, lots, status, booking code, Pickup/Shipping options
- [ ] Customers can book and reschedule within 2-hour rule
- [ ] Authorized pickup person can be added
- [ ] Shipping choice cannot be reversed online once selected

**Clerk and Release:**
- [ ] Admin/clerk can manually book and override
- [ ] Check-in search works by name, bidder #, and booking code
- [ ] Walk-in override bumps order to prep queue top
- [ ] Select All → deselect exceptions release flow works
- [ ] Withheld lots require reason before completion
- [ ] Cases auto-created from withheld lots
- [ ] Request Helper alert works
- [ ] Order Preparation Slip prints from check-in desk printer
- [ ] Order Release Confirmation Slip prints from check-in desk printer

**Cancellation and Cases:**
- [ ] Cancelled status with cancellation reason field exists
- [ ] Cancelled orders can be manually rebooked by admin/clerk
- [ ] Cases can be created, updated, and resolved
- [ ] Return intake flow works (scan or manual, existing or new case)
- [ ] Return Receipt prints from check-in desk printer
- [ ] Auto return confirmation notification fires

**Shipping:**
- [ ] Shipping follows In Queue / Prepared for Shipping / Dispatched only
- [ ] Tracking number can be pasted and sent one-by-one or batch
- [ ] Shipping orders excluded from pickup flow

**Notifications:**
- [ ] All 13 notification types fire at correct triggers
- [ ] Ready-for-pickup auto-fires when order becomes Ready
- [ ] Daily reminder fires when no choice made
- [ ] Saturday reminders and cancellation notice fire at correct times
- [ ] Review request only fires if no open case
- [ ] Templates are editable with variable placeholders
- [ ] Notification log shows all sent messages per customer per auction

**Final:**
- [ ] App is usable in real Bid Boss operations without falling back into chaos
