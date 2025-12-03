# Analytics Dashboards Guide

## 🎯 Where to Find Analytics

The analytics dashboards are available in two locations based on your role:

### 1. **Owner Dashboard** (`/overview`)
**Access:** Log in as an Owner user → Navigate to "Overview" in the sidebar

**URL:** `http://localhost:3000/overview`

**Features:**
- **KPI Cards:**
  - Open Alerts count
  - Devices Online (with total devices)
  - Events in last 24 hours

- **Events Activity Chart:**
  - Beautiful line chart showing events over the last 24 hours
  - Time-series visualization with hourly breakdown
  - Interactive tooltips showing exact event counts

- **Alerts by Severity Pie Chart:**
  - Visual breakdown of alerts by severity (High/Medium/Low)
  - Color-coded: Red (High), Orange (Medium), Blue (Low)
  - Percentage distribution

- **Recent Alerts List:**
  - Latest 5 open alerts with severity chips
  - Quick link to view all alerts

- **Device Health Summary:**
  - Overall system uptime gauge
  - Visual percentage indicator with status
  - Color-coded health status (Excellent/Good/Fair/Poor)

- **Rooms & Devices Table:**
  - Breakdown of devices per room
  - Clean table layout

### 2. **Operations Dashboard** (`/ops/overview`)
**Access:** Log in as Staff or Admin → Navigate to "Overview" under "Operations" section

**URL:** `http://localhost:3000/ops/overview`

**Features:**
- **KPI Cards:**
  - Total Homes across the platform
  - Total Devices
  - Devices Online (with uptime percentage)
  - Total Alerts (with High severity count)

- **Alerts Distribution Bar Chart:**
  - Bar chart showing alerts by severity
  - Color-coded bars for easy comparison
  - Interactive tooltips

- **Events by Home Chart:**
  - Bar chart showing event counts per home
  - Last 24 hours aggregation
  - Home names displayed clearly

- **System Health Gauge:**
  - Overall system uptime visualization
  - Large percentage display with progress bar
  - Status indicator chip

- **Alerts Heatmap Table:**
  - Comprehensive table showing alerts per home
  - Severity breakdown (High/Medium/Low) per home
  - Color-coded chips for quick status identification
  - Sorted by total alerts

- **Device Uptime Summary Table:**
  - Top 10 devices by uptime percentage
  - Events count over last 7 days
  - Last event timestamp
  - Color-coded uptime status

## 🚀 How to View the Dashboards

### Step 1: Start the Application

```bash
# Quick start (if already built)
./quick-start.sh

# Or full setup (if first time)
./setup-local.sh
```

### Step 2: Log In

**Owner Dashboard:**
- Email: `owner@example.com`
- Password: `owner123`
- Navigate to: **Overview** (in sidebar)

**Operations Dashboard:**
- Email: `staff@example.com`
- Password: `staff123`
- Navigate to: **Operations** → **Overview** (in sidebar)

### Step 3: Explore the Charts

1. **Hover over charts** to see detailed tooltips
2. **Click on chart elements** for more information
3. **Scroll through tables** to see all data
4. **Refresh the page** to get latest data (auto-refreshes every few seconds)

## 📊 Chart Types & Visualizations

### Line Charts
- **Events Over Time:** Shows event frequency over 24 hours
- **Smooth curves** with data points
- **Interactive tooltips** showing exact values

### Pie Charts
- **Alerts by Severity:** Circular chart with percentage labels
- **Color-coded segments** for easy identification
- **Legend** showing all categories

### Bar Charts
- **Alerts Distribution:** Horizontal bars for severity comparison
- **Events by Home:** Vertical bars showing event counts
- **Color-coded** for visual distinction

### Gauge Charts
- **Device Uptime:** Circular gauge with percentage
- **Progress bar** visualization
- **Status chips** (Excellent/Good/Fair/Poor)

### Tables
- **Sortable columns** (where applicable)
- **Color-coded chips** for status indicators
- **Hover effects** for better UX

## 🎨 Design Features

The dashboards follow **Google Cloud Console** and **Grafana** design principles:

- ✅ **Clean, modern UI** with Material Design
- ✅ **Consistent spacing** (8px grid system)
- ✅ **Professional color palette** (MUI theme)
- ✅ **Responsive layouts** (works on all screen sizes)
- ✅ **Interactive elements** (hover, tooltips, animations)
- ✅ **Loading states** (skeleton loaders)
- ✅ **Error handling** (friendly error messages)
- ✅ **Card-based layout** (Grafana-style panels)

## 📈 Data Sources

### Owner Dashboard
- **Postgres:** Alerts, Devices, Rooms
- **MongoDB:** Events (last 24h), Events time-series

### Operations Dashboard
- **Postgres:** Homes, Devices, Alerts (all homes)
- **MongoDB:** Events by home, Device uptime calculations

## 🔄 Real-Time Updates

- **WebSocket integration** for live alert updates
- **Auto-refresh** on data queries
- **RTK Query caching** for optimal performance

## 🛠️ Troubleshooting

### No charts showing?

1. **Check if MongoDB has events:**
   ```bash
   docker exec -it smart-home-mongo mongosh
   use smart_home
   db.events.countDocuments({})
   ```

2. **Seed MongoDB events if needed:**
   ```bash
   docker compose -f docker-compose.local.yml exec api uv run python scripts/seed_mongo_events.py --force
   ```

3. **Check browser console** for errors

4. **Verify API is running:**
   ```bash
   curl http://localhost:8000/healthz
   ```

### Charts look empty?

- Ensure you have events data in MongoDB (last 24-30 days)
- Check that your user has a home assigned
- Verify the home_id matches in the database

### Performance issues?

- Charts use **ResponsiveContainer** for optimal rendering
- Data is **cached** by RTK Query
- Large datasets are **paginated** in tables

## 📱 Mobile Responsiveness

All dashboards are fully responsive:
- **Desktop:** Full chart layouts with side-by-side panels
- **Tablet:** Stacked layout with full-width charts
- **Mobile:** Single column with optimized chart sizes

## 🎯 Best Practices

1. **Refresh regularly** to see latest data
2. **Use tooltips** to see exact values
3. **Check multiple time periods** (24h, 7d) where available
4. **Compare metrics** across different homes/devices
5. **Monitor trends** using time-series charts

## 🔗 Related Pages

- **Alerts Page:** `/alerts` - Detailed alert management
- **Devices Page:** `/devices` - Device management
- **Models Page:** `/models` - ML model configuration

---

**Enjoy exploring your analytics dashboards!** 🚀


