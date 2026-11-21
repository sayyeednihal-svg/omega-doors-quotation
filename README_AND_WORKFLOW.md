# Omega Doors Quotation Builder — App Structure & Workflow

## 1. Application Workflow
1. **Login Screen (`src/components/LoginScreen.tsx`)**
   - Default credentials: Username `omega` / Password `omega`.
   - Session state persisted in `sessionStorage`.
2. **Product Selection (`src/components/ProductSelection.tsx`)**
   - Select **UPVC Window** to start a new quotation (automatically allocates the next unique, locked sequential Quote No. `OME-QT-00000030`, `00000031`, ...).
   - Also supports resuming an active draft, loading sample quotation data (with a new locked Quote No.), or opening saved Quotation History.
3. **Client & Quotation Information (`src/components/ClientInfoStep.tsx`)**
   - Locked, read-only **Quote No.** (cannot be edited by any user).
   - Required **Quotation Created By** selector (`Nihal Sayyed`, `Yogesh Joshi`, `Nasiruddin Shaikh`, `Susheel Pandey`, `Sales`).
   - **UPVC Project Type** dropdown (`All UPVC Windows & Doors`, `Sliding Windows (2-Track / 3-Track)`, `Casement Windows`, `UPVC Doors (Sliding & Casement)`, `Fixed & Ventilators`, `Tilt & Turn / Villa Windows`, `Residential Apartment / Bungalow`, `Commercial / Office Project`).
   - Quote Date, Valid Upto, Responsible, Client Name, Mobile, Email, Site Address, and optional separate **Deliver To** recipient details.
4. **Window Details, Specifications & Pricing (`src/components/WindowBuilderStep.tsx`)**
   - **UPVC Window / Door Type** dropdown per item covering 12 UPVC window & door types (2-Track/3-Track/4-Panel Sliding, Single/Double Casement Windows, Sliding Balcony Door, Casement Door, Fixed Glass Window, Top-Hung Ventilator, Tilt & Turn Window, Combination Window).
   - Add one or more windows (**Add Window** / **Add More Windows**), duplicate, or delete.
   - Live technical CAD elevation SVG drawing tailored to each window/door type (`src/components/WindowCadSvg.tsx`).
   - Automatic area calculation:
     `Area (sq ft) = Width (mm) × Height (mm) × Quantity ÷ 92903.04`
   - Manual per-sq.ft rate entry + editable technical specs (Series, Profile Color, Glass, Mesh, Frame/Sash/RI, Hardware Accessories).
   - Editable Discount (`%` or `INR`), Transportation Cost, GST (`%`), and Payment Terms.
5. **Final Rates, 5-Page Preview, PDF Export & History (`src/components/QuotationPreviewStep.tsx` & `src/components/QuotationHistoryStep.tsx`)**
   - Confirm or edit per-sq.ft rates, Discount, Transportation, GST, and Payment Terms right before generating the PDF, with live Total Project Cost & Avg. price per Sqft without GST calculation.
   - Generates an exact 5-page A4 PDF (`src/utils/pdfGenerator.ts` using `jsPDF`):
     - Page 1: Cover letter, Omega & APL Apollo headers, To / Deliver To, Quote Info, and `Created By` signatory line
     - Page 2+: Window line items, CAD elevations, Materials, Accessories, Qty/Rate/Amount
     - Page 3: Area & price summary, Avg. price per Sqft without GST, Payment Terms, GST breakdown, Grand Total, Client signature
     - Page 4: Apollo Offerings & Profile Colors
     - Page 5: Terms & Conditions, Installation Pre-Requisites, Acceptance signatures
   - Automatically saves every generated/shared quotation (including `Created By`) to **Quotation History** (`src/utils/storage.ts`), supporting search (by Quote No., client, mobile, or creator), View, Download PDF, Share, New Quote Copy, **Download All (.zip)** (`jszip`), and JSON Backup Export/Import across phones.

---

## 2. Project File Structure
```text
├── index.html                          # HTML entry point & PWA mobile meta tags
├── metadata.json                       # App metadata
├── package.json                        # Dependencies & Vite scripts
├── tsconfig.json                       # TypeScript configuration
├── vite.config.ts                      # Vite + Tailwind v4 + VitePWA offline config
├── README_AND_WORKFLOW.md              # App structure & build guide
├── .github/workflows/build-apk.yml     # GitHub Actions cloud Android APK workflow
├── public/
│   ├── icon.svg                        # Vector app icon
│   ├── apple-touch-icon.png            # 180x180 iOS home icon
│   ├── pwa-192x192.png                 # 192x192 Android icon
│   ├── pwa-512x512.png                 # 512x512 Android icon
│   ├── pwa-maskable-512x512.png        # 512x512 padded adaptive maskable icon
│   └── assets/quotation/               # Extracted logos, banner, offerings & colors
└── src/
    ├── main.tsx                        # React entry + PWA service worker registration
    ├── index.css                       # Tailwind v4 theme & typography
    ├── App.tsx                         # Auth, navigation, draft & history orchestration
    ├── types/quotation.ts              # TypeScript interfaces
    ├── hooks/usePWAInstall.ts          # Android install prompt & online/offline hooks
    ├── utils/
    │   ├── calculations.ts             # Area formula, presets, totals & INR formatting
    │   ├── storage.ts                  # Locked sequential Quote No. & history storage
    │   └── pdfGenerator.ts             # 5-page A4 vector PDF generator (jsPDF)
    └── components/
        ├── LoginScreen.tsx             # omega / omega login
        ├── ProductSelection.tsx        # UPVC Window selector & quick actions
        ├── ClientInfoStep.tsx          # Client & Deliver To form + locked Quote No.
        ├── WindowBuilderStep.tsx       # Multi-window editor & pricing calculator
        ├── WindowCadSvg.tsx            # Proportional technical window CAD SVG
        ├── QuotationPreviewStep.tsx    # Final rate confirmation, 5-page preview & PDF export
        ├── QuotationHistoryStep.tsx    # Saved history, re-download, ZIP & backup sync
        ├── PWAInstallButton.tsx        # Android offline install & staff link sharing
        └── OfflineIndicator.tsx        # Offline connectivity notice
```

---

## 3. Running Locally & Building an Android `.apk`

### Run Locally
```bash
npm install
npm run dev
```

### Build Production Web / Offline PWA
```bash
npm install
npm run build
```
The compiled offline-ready web app is output to `dist/`.

### Build Android `.apk` Without Local Android Studio (GitHub Actions)
1. Upload the extracted files from this ZIP to a GitHub repository.
2. Open the **Actions** tab → **Build Android APK** → **Run workflow**.
3. When finished (~3 minutes), download the `Omega-Doors-Quotation-APK` artifact containing the `.apk`.

### Build Android `.apk` Locally (Capacitor + Android Studio)
```bash
npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Omega Quote" com.omegadoors.quotation --web-dir dist
npx cap add android
npx cap sync
npx cap open android
```
Then in Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
