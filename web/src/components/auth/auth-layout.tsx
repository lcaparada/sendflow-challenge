import { Box, Typography } from "@mui/material";
import { Send } from "@mui/icons-material";

type AuthLayoutProps = {
  panel: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    features: string[];
  };
  children: React.ReactNode;
};

export function AuthLayout({ panel, children }: AuthLayoutProps) {
  return (
    <Box className="flex min-h-screen">
      <Box
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        sx={{
          background:
            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            top: -80,
            left: -80,
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            bottom: -60,
            right: -60,
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            top: "50%",
            right: 80,
            animation: "float 7s ease-in-out infinite 1s",
          }}
        />

        <Box className="relative z-10 text-center px-12">
          <Box
            className="flex items-center justify-center w-20 h-20 rounded-2xl mb-8 mx-auto"
            sx={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            {panel.icon}
          </Box>
          <Typography variant="h3" fontWeight={800} sx={{ color: "white", mb: 2 }}>
            {panel.title}
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 400, maxWidth: 360 }}
          >
            {panel.subtitle}
          </Typography>

          <Box className="mt-12 flex flex-col gap-4">
            {panel.features.map((item, i) => (
              <Box
                key={i}
                className="flex items-center gap-3 px-5 py-3 rounded-xl"
                sx={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  animation: `slideIn 0.5s ease-out ${i * 0.1 + 0.3}s both`,
                }}
              >
                <Box className="w-2 h-2 rounded-full bg-white opacity-80" />
                <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        className="flex flex-col items-center justify-center flex-1 px-8 py-12"
        sx={{ background: "#fafafa" }}
      >
        <Box sx={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.6s ease-out both" }}>
          <Box className="flex lg:hidden items-center gap-2 mb-10 justify-center">
            <Box
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              sx={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
            >
              <Send sx={{ fontSize: 20, color: "white" }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#6366f1" }}>
              SendFlow
            </Typography>
          </Box>

          {children}
        </Box>
      </Box>
    </Box>
  );
}
