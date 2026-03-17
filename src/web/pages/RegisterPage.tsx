import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { register } from "../../functions/auth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError("Não foi possível criar a conta. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-screen bg-gray-100">
      <Paper elevation={3} className="w-full max-w-sm p-8">
        <Typography variant="h5" fontWeight={700} className="mb-6 text-center">
          Criar conta
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText="Mínimo de 6 caracteres"
          />
          <TextField
            label="Confirmar senha"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Cadastrar"}
          </Button>
        </Box>

        <Typography variant="body2" className="mt-4 text-center">
          Já tem uma conta?{" "}
          <Link component={RouterLink} to="/login">
            Entrar
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
