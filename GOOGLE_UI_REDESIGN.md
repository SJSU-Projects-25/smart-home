# Google Material Design 3 UI Redesign Guide

## 🎨 Design Principles Applied

This redesign follows **Google Material Design 3** principles, similar to Google Cloud Console and Google Workspace:

### Color Palette
- **Primary**: Google Blue (#1976d2)
- **Background**: Light gray (#f5f5f7) - Google's signature light background
- **Surface**: White (#ffffff) for cards
- **Text**: Dark gray (#1f2933) for primary text, lighter (#6b7280) for secondary
- **Accents**: Standard Material colors (success, warning, error, info)

### Typography
- **Font**: Google Sans / Roboto (system fallback)
- **Weights**: 400 for headings, 500 for emphasis
- **Sizes**: Consistent hierarchy (h4 for page titles, h6 for card headers)

### Spacing
- **8px grid system**: All spacing multiples of 8px
- **Card padding**: 24px (3 * 8px)
- **Section gaps**: 24-32px between major sections

### Components
- **Cards**: Subtle elevation (0-1), thin borders, rounded corners (12px)
- **Buttons**: No text transform, 8px border radius, subtle shadows
- **Tables**: Clean headers with light gray background
- **Charts**: Professional styling with proper tooltips and legends

## 📊 Analytics Dashboards

### 1. Owner Dashboard (`/overview`)

**Access:** Log in as Owner → Click "Overview" in sidebar

**Features:**
- **4 KPI Cards:**
  - Open Alerts (with high priority count)
  - Devices Online (with total)
  - Events (Last 24h)
  - Rooms count

- **Events Activity Chart:**
  - Line chart showing events over last 24 hours
  - Hourly breakdown with interactive tooltips
  - Smooth curves with data points

- **Alerts by Severity:**
  - Pie chart with color-coded segments
  - Percentage labels
  - Legend showing High/Medium/Low

- **Device Status:**
  - Pie chart showing online vs offline devices
  - Large percentage display
  - Status indicator

- **Alert Trends:**
  - Area chart showing alert trends over last 7 days
  - Stacked by severity (High/Medium/Low)
  - Gradient fills for visual appeal

- **Room Activity:**
  - Bar chart showing devices per room
  - Color-coded by activity level
  - Easy room comparison

- **System Health Gauge:**
  - Circular gauge with percentage
  - Progress bar visualization
  - Status chip (Excellent/Good/Fair/Poor)

- **Recent Alerts List:**
  - Latest 5 alerts with severity chips
  - Timestamps and room information
  - Link to view all alerts

- **Rooms & Devices Table:**
  - Clean table with room names
  - Device counts and alert counts per room
  - Hover effects

### 2. Operations Dashboard (`/ops/overview`)

**Access:** Log in as Staff/Admin → Click "Operations" → "Overview"

**Features:**
- **4 KPI Cards:**
  - Total Homes
  - Total Devices (with online count)
  - Total Alerts (with high count)
  - Events (24h) platform-wide

- **Platform Device Status:**
  - Pie chart showing online/offline devices
  - Overall system health percentage

- **Alerts Distribution:**
  - Bar chart by severity
  - Color-coded bars for quick comparison

- **Events by Home:**
  - Bar chart showing event counts per home
  - Last 24 hours aggregation
  - Home names clearly displayed

- **Alerts Heatmap Table:**
  - Comprehensive table with all homes
  - Severity breakdown per home
  - Color-coded chips for quick status identification

- **Device Uptime Summary:**
  - Top 10 devices by uptime
  - Events count over 7 days
  - Last event timestamp
  - Color-coded uptime status

### 3. Technician Dashboard (`/tech/overview`)

**Access:** Log in as Technician → Click "Tech" → "Overview"

**Features:**
- **4 KPI Cards:**
  - Assigned Homes count
  - Total Devices (with online count)
  - Open Alerts (with high priority)
  - Events (24h) across assigned homes

- **Device Status:**
  - Pie chart for all assigned homes
  - Online/offline breakdown

- **Alerts by Severity:**
  - Bar chart showing alert distribution
  - Focus on assigned homes only

- **Events by Home:**
  - Bar chart for assigned homes
  - Event activity comparison

- **Assigned Homes Table:**
  - Detailed table with:
    - Home name
    - Device counts (total and online)
    - Open alerts per home
    - Events in last 24h
  - Color-coded status indicators

### 4. Admin Dashboard (`/admin/overview`)

**Access:** Log in as Admin → Click "Admin" → "Overview"

**Features:**
- **8 KPI Cards:**
  - Total Homes
  - Total Users
  - Total Devices (with online)
  - Total Alerts (with high)
  - Events (24h) platform-wide
  - Owners count
  - Technicians count
  - Staff count

- **Platform Device Status:**
  - Overall system health visualization

- **Alerts Distribution:**
  - Platform-wide alert breakdown

- **Events by Home:**
  - All homes event activity

- **Top Homes by Alerts:**
  - Table showing homes with most alerts
  - Quick identification of problem homes

- **Users by Role:**
  - Grid display of user counts by role
  - Clean card-based layout

## 🎯 Key Visualizations

### Chart Types Used

1. **Line Charts** (Events Over Time)
   - Time-series data
   - Smooth curves
   - Interactive tooltips

2. **Pie Charts** (Alerts by Severity, Device Status)
   - Percentage distribution
   - Color-coded segments
   - Legends

3. **Bar Charts** (Alerts Distribution, Events by Home, Room Activity)
   - Comparison visualization
   - Color-coded bars
   - Rotated labels for readability

4. **Area Charts** (Alert Trends)
   - Stacked areas by severity
   - Gradient fills
   - Trend visualization

5. **Gauge Charts** (Device Uptime)
   - Percentage display
   - Progress bars
   - Status indicators

## 🚀 How to View

### Quick Access

1. **Owner Dashboard:**
   ```
   URL: http://localhost:3000/overview
   Login: owner@example.com / owner123
   ```

2. **Operations Dashboard:**
   ```
   URL: http://localhost:3000/ops/overview
   Login: staff@example.com / staff123
   ```

3. **Technician Dashboard:**
   ```
   URL: http://localhost:3000/tech/overview
   Login: tech@example.com / tech123
   ```

4. **Admin Dashboard:**
   ```
   URL: http://localhost:3000/admin/overview
   Login: admin@gmail.com / admin123
   ```

### Navigation

All dashboards are accessible from the sidebar:
- **Owner**: Overview (first item)
- **Technician**: Tech → Overview
- **Staff**: Operations → Overview
- **Admin**: Admin → Overview

## 📈 Data Sources

### Real-Time Data
- **Postgres**: Homes, Devices, Alerts, Rooms, Users
- **MongoDB**: Events (time-series), Device uptime calculations
- **WebSocket**: Live alert updates

### Time Ranges
- **24 hours**: Events activity, recent alerts
- **7 days**: Alert trends, device uptime
- **30 days**: Historical data (from seed)

## 🎨 UI Improvements

### Before vs After

**Before:**
- Dark theme with neon colors
- Heavy shadows and blur effects
- Inconsistent spacing

**After:**
- Light theme matching Google Cloud Console
- Clean, minimal design
- Consistent 8px spacing grid
- Professional color palette
- Subtle elevations and borders
- Google Sans typography

### Design Elements

1. **Cards:**
   - White background
   - Thin borders (#e0e0e0)
   - 12px border radius
   - Subtle hover effects

2. **KPI Cards:**
   - Icons with color coding
   - Large numbers (h3)
   - Subtle trend indicators
   - Hover elevation

3. **Charts:**
   - Clean grid lines
   - Professional tooltips
   - Color-coded data series
   - Responsive containers

4. **Tables:**
   - Light gray headers
   - Hover row effects
   - Color-coded chips
   - Clean typography

## 🔧 Technical Implementation

### Libraries Used
- **Recharts**: Professional charting library
- **Material UI v5**: Component library
- **Material Design 3**: Design system

### Chart Components
- `EventsOverTimeChart`: Line chart for time-series
- `AlertsBySeverityChart`: Pie/Bar chart for distribution
- `DeviceStatusChart`: Pie chart for status
- `RoomActivityChart`: Bar chart for room comparison
- `AlertTrendChart`: Area chart for trends
- `DeviceUptimeGauge`: Gauge for percentages
- `EventsByHomeChart`: Bar chart for home comparison

### Backend Endpoints
- `GET /owner/overview` - Owner analytics
- `GET /owner/events/timeseries` - Events time-series
- `GET /ops/overview` - Operations analytics
- `GET /ops/alerts/heatmap` - Alerts heatmap
- `GET /tech/overview` - Technician analytics
- `GET /admin/overview` - Admin analytics

## 📱 Responsive Design

All dashboards are fully responsive:
- **Desktop (≥960px)**: Full layout with side-by-side charts
- **Tablet (768-959px)**: Stacked layout, full-width charts
- **Mobile (<768px)**: Single column, optimized chart sizes

## 🎯 Best Practices

1. **Hover over charts** to see detailed tooltips
2. **Click on table rows** for more details (where applicable)
3. **Refresh page** to get latest data
4. **Check multiple dashboards** for different perspectives
5. **Use color coding** to quickly identify status

## 🐛 Troubleshooting

### Charts not showing data?

1. **Check MongoDB events:**
   ```bash
   docker compose -f docker-compose.local.yml exec mongo mongosh
   use smart_home
   db.events.countDocuments({})
   ```

2. **Re-seed events if needed:**
   ```bash
   docker compose -f docker-compose.local.yml exec api uv run python scripts/seed_mongo_events.py --force
   ```

3. **Verify API endpoints:**
   - Check browser console for errors
   - Verify API is running: `curl http://localhost:8000/healthz`

### UI looks different?

- Clear browser cache
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check that frontend container is running

---

**Enjoy your beautiful, Google-style analytics dashboards!** 🎉


