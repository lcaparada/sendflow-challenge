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
  Tooltip,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import HubIcon from "@mui/icons-material/Hub";
import ContactsIcon from "@mui/icons-material/Contacts";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { logout } from "../functions/auth";
import { useState, type ReactNode } from "react";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <>
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
              onClick={() => handleNavClick(path)}
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
    </>
  );

  return (
    <Box className="flex min-h-screen" sx={{ background: "#f8f9fc" }}>
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            background: "#1a1a2e",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              className="flex items-center justify-center w-7 h-7 rounded-lg mr-2"
              sx={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              <SendIcon sx={{ fontSize: 14, color: "white" }} />
            </Box>
            <Typography
              fontWeight={800}
              sx={{ color: "white", letterSpacing: "-0.3px" }}
            >
              SendFlow
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: 0,
          ...(isMobile && { zIndex: theme.zIndex.drawer + 2 }),
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
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 5 },
          pt: { xs: 10, md: 5 },
          minWidth: 0,
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
