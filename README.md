# Globpay Banking Dashboard

This dashboard is based on the Globpay new design dashboard and wired to the Go backend in `virtualpay_backend`.

## What's Included

### Dashboard Layout
- **Dashboard Layout**: `/src/layout/Dashboard/` - Main dashboard layout with header, drawer, and footer
- **Dashboard Page**: `/src/pages/dashboard/default.jsx` - Default dashboard page with analytics
- **Dashboard Sections**: `/src/sections/dashboard/` - Dashboard-specific components (charts, tables, cards)

### Drawer Component
- **Drawer**: `/src/layout/Dashboard/Drawer/` - Navigation drawer component
- **Drawer Content**: Navigation items, header, and card components
- **Menu Items**: `/src/menu-items/dashboard.jsx` - Dashboard menu configuration

### Supporting Files
- **Components**: `/src/components/` - Reusable UI components (cards, buttons, etc.)
- **Themes**: `/src/themes/` - Material-UI theme configuration
- **Routes**: `/src/routes/` - React Router configuration
- **Assets**: `/src/assets/` - Images and styles
- **Utils**: `/src/utils/` - Utility functions
- **API**: `/src/api/menu.js` - Menu state management

## Usage

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Configure environment:
   - Copy `.env.example` to `.env` and set any required `VITE_*` values (then restart the dev server).
   - For local development with the backend in this repo, `VITE_API_URL` should be `http://localhost:8092`.

3. Start the development server:
   ```bash
   yarn start
   ```

4. Build for production:
   ```bash
   yarn build
   ```

## Notes

All authentication pages, component overview pages, and extra pages have been removed. Only the dashboard and its drawer navigation remain.
# globpay-banking-dash
