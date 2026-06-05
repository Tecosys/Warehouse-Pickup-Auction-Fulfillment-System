# BidBoss — Part 3 Complete End-to-End Manual Testing Guide

This guide describes how to manually test the complete operational flow of Part 3 of the Warehouse Pickup & Auction Fulfillment System:
**Import → Customer Portal Link → Pickup/Shipping Choice → Pickup Slot Booking → Prep Queue → Check-in → Release / Partial Release → Receipt → Case Creation → disputes → returns → Closeout/Restocking Reconciliation.**

To test it with your specific emails (`munjalsharmaa@gmail.com`, `munjalsharma2708@gmail.com`, and `22043582010@maitreyi.du.ac.in`), we have updated three customized CSV files for you:
1. **HiBid Results:** [hibid_results.csv](file:///c:/Users/Guneet/Warehouse-Pickup-Auction-Fulfillment-System/scratch/test_data/hibid_results.csv)
2. **AuctionFlex Bidders:** [auctionflex_bidders.csv](file:///c:/Users/Guneet/Warehouse-Pickup-Auction-Fulfillment-System/scratch/test_data/auctionflex_bidders.csv) (mapped to your test emails)
3. **ManyFast Catalog:** [manyfast_catalog.csv](file:///c:/Users/Guneet/Warehouse-Pickup-Auction-Fulfillment-System/scratch/test_data/manyfast_catalog.csv)

---

## 🛠️ Step 0: Setup and Launch Local Servers

Open separate terminals (e.g., PowerShell or Command Prompt) and launch the three services.

### 0.1 Install Dependencies
Run this command once at the root directory of your workspace to ensure all dependencies are installed:
```powershell
npm install
```

### 0.2 Start the Backend API (Port 5000)
```powershell
cd apps/api
npm run dev
```
*Note: Make sure the server reports "Connected to MongoDB" and "Server is running on port 5000".*

### 0.3 Start the Admin Portal (Port 5173)
```powershell
cd apps/admin
npm run dev
```
*Note: The console will output the local address, usually `http://localhost:5173`.*

### 0.4 Start the Customer Portal Client (Port 3000)
```powershell
cd apps/client
npm run dev
```
*Note: The Next.js dev server will start on `http://localhost:3000`.*

---

## 📂 Step 1: Import the Auction Data

1. Open your browser and navigate to the **Admin Portal** (`http://localhost:5173`).
2. Log in using the **Admin** credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Click on **File Import** in the sidebar.
4. Fill in the **Auction Reference**:
   - **Auction #:** `101`
   - **Auction Title:** `Test Auction Run 101`
5. Upload the three files located in `c:\Users\Guneet\Warehouse-Pickup-Auction-Fulfillment-System\scratch\test_data\`:
   - **HiBid Lots Export:** `hibid_results.csv`
   - **AuctionFlex Bidders:** `auctionflex_bidders.csv`
   - **ManyFastScan CSV:** `manyfast_catalog.csv`
6. Click **Process & Align Run**. Wait for the orbital loader to complete.
7. Once the import completes, you will see a success screen displaying stats:
   - **Orders Created:** 3
   - **Lots Created:** 5
   - **Customers Matched:** 3
8. Click **Send Initial Customer Links** to trigger the initial batch notifications.

---

## 🔗 Step 2: Access Customer Portal Links & Choose Actions

We have three test customers representing different flows. Copy their unique links from the "Generated Booking Links" table on the success screen or construct them:
- **Bidder 1001 (Pickup Flow):** `http://localhost:3000/order/BB-101-1001` (Email: `munjalsharmaa@gmail.com`)
- **Bidder 1002 (Shipping Flow):** `http://localhost:3000/order/BB-101-1002` (Email: `munjalsharma2708@gmail.com`)
- **Bidder 1003 (Cases & Disputes Flow):** `http://localhost:3000/order/BB-101-1003` (Email: `22043582010@maitreyi.du.ac.in`)

---

## 📅 Step 3: Test the Pickup Flow (Bidder 1001)

### 3.1 Initialize Slot Management (Admin)
Before booking, the admin must set up available time slots:
1. In the Admin Portal (`http://localhost:5173`), go to **Slot Management**.
2. Click **Initialize Slots**.
3. Select today's date and click **Create Slots**.

### 3.2 Customer Booking (Customer Portal)
1. Open the Customer Portal for Bidder 1001: `http://localhost:3000/order/BB-101-1001`
2. Scroll to the **Self-Pickup** section and click **Book Pickup Slot**.
3. Select an available date and time slot from the calendar.
4. Enter an **Authorized Pickup Person** name (e.g., "John Doe") and phone number.
5. Click **Confirm Booking**. The portal will update to display a confirmed status chip and booking details.

### 3.3 Warehouse Order Preparation (Prep Queue)
1. Log in to the Admin Portal as a warehouse worker:
   - **Username:** `worker`
   - **Password:** `worker123`
2. Look at the **Prep Queue** and locate Order **1001**.
3. Click **Open Order** -> Click **Start Preparation** (changes status to `In Progress`).
4. Inside the order, you will see two lots:
   - **Lot 1:** Google Nest Hub (Source Location: `B02-A`). Assign to Final Pickup Location: `BIN01`.
   - **Lot 2:** Sony Wireless Headphones (Source Location: `A05-B`). Assign to Final Pickup Location: `PU01`.
5. Tap **Complete Preparation**. The system updates the order preparation status to **Ready** and triggers an automated notification.

### 3.4 Front Desk Check-in & Release (Clerk Desk)
1. Log in to the Admin Portal as a clerk:
   - **Username:** `clerk`
   - **Password:** `clerk123`
2. In the Search bar, search for `1001`. Locate the order card and click **Check In**.
3. Once Checked In, click **Open Release** on Bidder 1001's card.
4. Observe the **Authorized Pickup Person** showing "John Doe".
5. The release screen defaults to all items checked. Let's test a **Partial Release**:
   - Keep **Lot 1** checked (Google Nest Hub is handed over).
   - Uncheck **Lot 2** (Sony Headphones withheld).
6. Click the **Proceed to Withheld Details** button that appears.
7. Set a reason for withholding **Lot 2**: select **Missing at Release** or **Issue** and add notes (e.g., "Box damaged, keeping for manager review").
8. Click **Complete Partial Release**.
9. The system will display the receipt confirmation showing Lot 1 released and Lot 2 withheld. A support case will be automatically created.

---

## 🚚 Step 4: Test the Shipping Flow (Bidder 1002)

### 4.1 Customer Choice (Customer Portal)
1. Open the Customer Portal for Bidder 1002: `http://localhost:3000/order/BB-101-1002`
2. Scroll to the **Deliver / Ship** section and click **Request Shipping**.
3. Confirm the choice in the popup window.
4. The screen will immediately update to state that shipping is selected and lock out pickup booking.

### 4.2 Warehouse Shipping Management (Admin)
1. Log in to the Admin Portal as `admin` (`admin` / `admin123`) or `support` (`support` / `support123`).
2. Go to the **Shipping** module.
3. Under the **In Queue** tab, locate Bidder 1002.
4. First prepare the items in the fulfillment queue:
   - Go to **Fulfillment Hub** -> find Order **1002** -> Click **Open Order** -> **Start Prep**.
   - Input bin/location for **Lot 3** (Ninja Blender) -> Click **Complete Preparation**.
5. Back in the **Shipping** module -> **In Queue** tab -> Click **Mark Packed** for Bidder 1002.
6. Open the **Prepared** tab, find Bidder 1002's card, and click **Dispatch**.
7. Enter a courier tracking number (e.g., `1Z999AA10123456784`) and click **Dispatch**.
8. Refresh the Customer Portal for Bidder 1002 to verify that the tracking link is now active and clickable!

---

## ⚠️ Step 5: Test the Cases, Returns and Disputes Flow (Bidder 1003)

### 5.0 Customer Choice & Booking (Customer Portal)
1. Open the Customer Portal for Bidder 1003: `http://localhost:3000/order/BB-101-1003`
2. Scroll to the **Self-Pickup** section and click **Book Pickup Slot**.
3. Select an available date and time slot.
4. Click **Confirm Booking**. The portal will update to display a confirmed status chip and booking details.

### 5.1 Fulfilling the Order (Admin)
1. Go to **Fulfillment Hub** -> find Order **1003** -> **Start Prep**.
2. Assign locations for **Lot 4** (Apple AirTag) and **Lot 5** (Logitech MX Master).
3. Click **Complete Preparation**.
4. Log in as `clerk` / `clerk123`. Search `1003`, click **Check In**, then click **Open Release**.
5. Select all lots and click **Complete Release**. (Order is now fully Picked Up).

### 5.2 Customer Submits a Dispute (Customer Portal)
1. Open the Customer Portal for Bidder 1003: `http://localhost:3000/order/BB-101-1003`
2. Go to the **Won Items & Disputes** tab.
3. Select **Lot 5** (Logitech MX Master) and click **File Dispute**.
4. Select a reason (e.g., **Damaged / Broken**) and add notes (e.g., "The scroll wheel is sticking").
5. Upload an image/screenshot as evidence. (Multer memoryStorage will immediately process this and render it statelessly without Vercel filesystem errors).
6. Click **Submit Dispute**. The portal will redirect you to the **Support Tickets & Returns** tab showing your open case.

### 5.3 Resolving the Case (Admin)
1. Log in to the Admin Portal as `admin` or `support`. Go to **Issues / Returns** -> **Open Cases**.
2. Click on the newly created case (e.g., `CAS-10002`). The detail drawer will open.
3. View the customer's uploaded evidence image.
4. **Test Resolution (Store Credit)**:
   - Set **Case Status** to `Resolved`.
   - Set **Refund Status** to `Authorized`.
   - Set **Refund Amount** to `129.00`.
   - Set **Refund Method** to `Store Credit`.
   - Click **Save Resolution & Refund Details**.
5. Verify: The system automatically generates a **Credit Code** linked to the customer, incrementing their credit balance.

---

## 📊 Step 6: Test the Auction Close & Reconciliation Process

### 6.1 View Closeout Summary (Reconciliation Page)
1. Log in to the Admin Portal as `admin` (`admin` / `admin123`).
2. Go to **Dashboard** -> switch to the **Closeout** tab.
3. Observe the closeout warnings. Since Bidder 1001 still has a withheld lot (`Lot 2`) that was marked as `Missing at Release`, the summary will display outstanding warnings.
4. Under **Fulfillment Exceptions** or **Open Cases**, you will see that `Lot 2` is still open.

### 6.2 Admin Marks Lot as Found & Released
1. While in the Admin Portal, go to **Issues / Returns** -> **Open Cases**.
2. Locate Bidder 1001's open case (for the withheld Sony Headphones).
3. Inside the **Disputed Lots** table, locate the row for `Lot 2` and click the green **Found & Release** button.
4. Verify: 
   - The lot status immediately updates to `Released`.
   - The case line updates to `Found & Released`.
   - If this was the only pending issue, the case status will automatically update to `Resolved`.
   - Go to **Dashboard** -> **Closeout** tab -> verify that the warnings have cleared!

### 6.3 Execute Closeout & Restocking Reconciliations
1. In the **Closeout** tab of the **Dashboard**, check the **I confirm** checkbox.
2. Click **Execute Closeout**.
3. If there were any unpaid or unreleased orders remaining, the system would automatically apply the restocking fee configurations, cancel the orders, and log them under the Restocking Reports.
4. Review the generated **Accounting Support Package** and audit logs!

---

## 📈 Step 7: exact Test Run to Show the Client (Copy-Paste Template)

To present a clean test log to your client, perform the exact steps using the details below:

| Parameter | Value to Use |
| :--- | :--- |
| **Auction Run ID** | `BB-101` |
| **Auction Title** | `Test Auction Run 101` |
| **Bidder 1001 Email** | `munjalsharmaa@gmail.com` |
| **Bidder 1002 Email** | `munjalsharma2708@gmail.com` |
| **Bidder 1003 Email** | `22043582010@maitreyi.du.ac.in` |

Once you run this test, you can copy the **Real-time Activity Log** from the bottom of the **Dashboard** page and send it to the client as an audit trail of the successful run.
