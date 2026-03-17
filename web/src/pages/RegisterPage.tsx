import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Link,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Send,
  PersonAdd,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { register } from "../functions/auth";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover fieldset": { borderColor: "#6366f1" },
    "&.Mui-focused fieldset": { borderColor: "#6366f1" },
  },
  "& label.Mui-focused": { color: "#6366f1" },
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate("/connections");
    } catch {
      setError(
        "Não foi possível criar a conta. Verifique os dados e tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

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
            <PersonAdd sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{ color: "white", mb: 2 }}
          >
            Crie sua conta
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontWeight: 400,
              maxWidth: 360,
            }}
          >
            Comece agora a gerenciar suas conexões e disparos de mensagens
          </Typography>

          <Box className="mt-12 flex flex-col gap-4">
            {[
              "Cadastro gratuito",
              "Acesso imediato",
              "Dados isolados por conta",
            ].map((item, i) => (
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
                <Typography
                  sx={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }}
                >
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
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            animation: "fadeUp 0.6s ease-out both",
          }}
        >
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

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#1a1a2e", mb: 1 }}
          >
            Criar conta
          </Typography>
          <Typography variant="body1" sx={{ color: "#6b7280", mb: 4 }}>
            Preencha os dados para começar
          </Typography>

          {error && (
            <Alert
              severity="error"
              className="mb-4"
              sx={{ borderRadius: 2, animation: "shake 0.4s ease-out" }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <TextField
              label="E-mail"
              type="email"
              value={email}
              placeholder="Digite seu e-mail"
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#9ca3af", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={textFieldSx}
            />

            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="******"
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              helperText="Mínimo de 6 caracteres"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#9ca3af", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff
                            sx={{ fontSize: 20, color: "#9ca3af" }}
                          />
                        ) : (
                          <Visibility sx={{ fontSize: 20, color: "#9ca3af" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={textFieldSx}
            />

            <TextField
              label="Confirmar senha"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="******"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#9ca3af", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showConfirm ? (
                          <VisibilityOff
                            sx={{ fontSize: 20, color: "#9ca3af" }}
                          />
                        ) : (
                          <Visibility sx={{ fontSize: 20, color: "#9ca3af" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={textFieldSx}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 16,
                textTransform: "none",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f52e0 0%, #7c3aed 100%)",
                  boxShadow: "0 6px 24px rgba(99,102,241,0.5)",
                  transform: "translateY(-1px)",
                },
                "&:active": { transform: "translateY(0)" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Cadastrar"
              )}
            </Button>
          </Box>

          <Typography
            variant="body2"
            className="pt-6 text-center"
            sx={{ color: "#6b7280" }}
          >
            Já tem uma conta?{" "}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: "#6366f1",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Entrar
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
