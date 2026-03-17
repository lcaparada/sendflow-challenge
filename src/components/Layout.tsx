import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HubIcon from "@mui/icons-material/Hub";
import ContactsIcon from "@mui/icons-material/Contacts";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { logout } from "../functions/auth";
import type { ReactNode } from "react";

const DRAWER_WIDTH = 240;

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
    <Box className="flex min-h-screen" sx={{ background: "#f8f9fc" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
            background: "#1a1a2e",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box className="flex items-center gap-3 px-5 py-6">
          <Box
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            sx={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          >
            <SendIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: "white", letterSpacing: "-0.3px" }}
          >
            SendFlow
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />

        <List sx={{ px: 2, pt: 2, flex: 1 }}>
          {navItems.map(({ label, icon, path }) => {
            const active = location.pathname === path;
            return (
              <ListItemButton
                key={path}
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: 2,
                  py: 1.2,
                  color: active ? "white" : "rgba(255,255,255,0.5)",
                  background: active
                    ? "linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.6))"
                    : "transparent",
                  "&:hover": {
                    background: active
                      ? "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(168,85,247,0.7))"
                      : "rgba(255,255,255,0.06)",
                    color: "white",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: active ? "white" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{
                    primary: {
                      style: { fontWeight: active ? 700 : 500, fontSize: 14 },
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ px: 2, pb: 4 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />
          <Tooltip title="Sair" placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1.2,
                color: "rgba(255,255,255,0.4)",
                "&:hover": {
                  background: "rgba(239,68,68,0.15)",
                  color: "#f87171",
                },
                transition: "all 0.15s ease",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Sair"
                slotProps={{
                  primary: { style: { fontWeight: 500, fontSize: 14 } },
                }}
              />
            </ListItemButton>
          </Tooltip>
        </Box>
      </Drawer>

      <Box component="main" className="w-full p-8 ">
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
