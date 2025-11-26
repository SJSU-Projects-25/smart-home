/** Side navigation drawer component. */
"use client";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Toolbar,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DevicesIcon from "@mui/icons-material/Devices";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ScienceIcon from "@mui/icons-material/Science";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const DRAWER_WIDTH = 240;

interface SideNavProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  section?: string;
}

const ownerNavItems: NavItem[] = [
  { label: "Overview", path: "/overview", icon: <DashboardIcon />, roles: ["owner"] },
  { label: "Alerts", path: "/alerts", icon: <NotificationsIcon />, roles: ["owner"] },
  { label: "Devices", path: "/devices", icon: <DevicesIcon />, roles: ["owner"] },
  { label: "Models", path: "/models", icon: <ScienceIcon />, roles: ["owner"] },
  { label: "Settings", path: "/settings/contacts", icon: <SettingsIcon />, roles: ["owner"] },
];

const technicianNavItems: NavItem[] = [
  { label: "Assignments", path: "/tech/assignments", icon: <AssignmentIcon />, roles: ["technician"], section: "Tech" },
  { label: "Devices", path: "/tech/devices", icon: <DevicesIcon />, roles: ["technician"] },
  { label: "Tests", path: "/tech/tests", icon: <ScienceIcon />, roles: ["technician"] },
  { label: "Network", path: "/tech/network", icon: <NetworkCheckIcon />, roles: ["technician"] },
];

const staffNavItems: NavItem[] = [
  { label: "Overview", path: "/ops/overview", icon: <DashboardIcon />, roles: ["staff"], section: "Ops" },
  { label: "Alerts", path: "/ops/alerts", icon: <NotificationsIcon />, roles: ["staff"] },
  { label: "Houses", path: "/ops/houses", icon: <HomeIcon />, roles: ["staff"] },
  { label: "Audit", path: "/ops/audit", icon: <AssignmentIcon />, roles: ["staff"] },
  { label: "Models", path: "/ops/models", icon: <ScienceIcon />, roles: ["staff"] },
];

const adminNavItems: NavItem[] = [
  { label: "Users", path: "/admin/users", icon: <PeopleIcon />, roles: ["admin"], section: "Admin" },
  { label: "Homes", path: "/admin/homes", icon: <HomeIcon />, roles: ["admin"] },
];

export function SideNav({ open, onClose }: SideNavProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);

  const getNavItems = (): NavItem[] => {
    if (!user) return [];
    switch (user.role) {
      case "owner":
        return ownerNavItems;
      case "technician":
        return technicianNavItems;
      case "staff":
        return staffNavItems;
      case "admin":
        return [...adminNavItems, ...ownerNavItems, ...staffNavItems];
      default:
        return [];
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const navItems = getNavItems();

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          mt: 8, // 64px for AppBar
        },
      }}
    >
      <Toolbar />
      <List>
        {navItems.map((item, index) => {
          const showDivider = index > 0 && item.section && navItems[index - 1].section !== item.section;
          return (
            <div key={item.path}>
              {showDivider && <Divider sx={{ my: 1 }} />}
              <ListItem disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            </div>
          );
        })}
      </List>
    </Drawer>
  );
}
