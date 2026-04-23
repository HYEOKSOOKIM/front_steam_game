# Report Cleanup Notes

## Current Active Route

- `/report` is wired in `src/App.jsx`.
- The active page component is `src/features/report/pages/ReportPage.jsx`.
- Active report UI dependencies:
  - `src/features/report/components/Topbar.jsx`
  - `src/features/report/components/DecisionGrid.jsx`
  - `src/features/report/components/FitGrid.jsx`
  - `src/features/report/components/StrengthRiskSection.jsx`
  - `src/features/report/components/EvidenceSection.jsx`
  - `src/features/report/components/StatusFooter.jsx`
  - `src/features/report/utils/reportMappers.js`
  - `src/features/report/api/reportApi.js`
  - `src/features/report/styles/report.css`

## Removed Legacy File

- `src/features/report/ReportPage.jsx`

Reason:

- It is not imported by `src/App.jsx`.
- Repository search shows no active import path to this file.
- It imports `./api/reportApi` and `./styles/report.css` from the feature root, but the routed implementation uses `pages/ReportPage.jsx` and sibling `../api`, `../components`, `../utils` imports.
- It contains broken Korean labels and older report-job UI that does not match the current `report_display`-first MVP screen.

Result:

- Removed from the frontend source tree.
- If job creation UI is still needed later, reintroduce it as a small component in the active `pages/ReportPage.jsx` flow instead of restoring a second page implementation.

## Do Not Remove Yet

- `src/types/reportV1.ts`
- `src/types/reportV1Sections.ts`

Reason:

- They are not currently imported by the active JSX route, but they document the backend report schema and can be useful when the frontend is migrated to TypeScript or stricter DTO validation.

## Follow-up Checklist

- Confirm no external docs reference the removed `src/features/report/ReportPage.jsx` path.
- Keep `frontend/docs` updated if the active report entry point changes.
