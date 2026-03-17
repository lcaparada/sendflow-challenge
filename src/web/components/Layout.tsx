import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HubIcon from "@mui/icons-material/Hub";
import ContactsIcon from "@mui/icons-material/Contacts";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { logout } from "../../functions/auth";
import type { ReactNode } from "react";

const DRAWER_WIDTH = 220;

type NavItem = {
  label: string;
  icon: ReactNode;
  path: string;
};

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const navigate = useNavigate();
  const { connectionId } = useParams();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: "Conexões",
      icon: <HubIcon />,
      path: "/connections",
    },
    ...(connectionId
      ? [
          {
            label: "Contatos",
            icon: <ContactsIcon />,
            path: `/connections/${connectionId}/contacts`,
          },
          {
            label: "Mensagens",
            icon: <SendIcon />,
            path: `/connections/${connectionId}/messages`,
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box className="flex min-h-screen">
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar className="flex justify-between">
          <Typography variant="h6" fontWeight={700}>
            SendFlow
          </Typography>
          <Tooltip title="Sair">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List>
          {navItems.map(({ label, icon, path }) => (
            <ListItemButton
              key={path}
              selected={location.pathname === path}
              onClick={() => navigate(path)}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        className="flex-1 p-6"
        sx={{ marginTop: "64px", marginLeft: `${DRAWER_WIDTH}px` }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
