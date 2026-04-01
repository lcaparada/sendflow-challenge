import { useState } from "react";
import { InputAdornment } from "@mui/material";
import { Email, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../modules/auth/auth.service";
import { loginSchema, type LoginSchemaType } from "../modules";
import { AuthCard, AuthLayout, AuthTextField, PasswordField } from "../components";

const LoginPage = () => {
  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginSchemaType) => {
    setFirebaseError("");
    try {
      await login(data.email, data.password);
      navigate("/connections");
    } catch {
      setFirebaseError("E-mail ou senha inválidos.");
    }
  };

  return (
    <AuthLayout
      panel={{
        icon: <Send sx={{ fontSize: 40, color: "white" }} />,
        title: "SendFlow",
        subtitle: "Gerencie suas conexões e envie mensagens com facilidade",
        features: ["Conexões centralizadas", "Contatos organizados", "Disparos agendados"],
      }}
    >
      <AuthCard
        title="Bem-vindo de volta"
        subtitle="Entre na sua conta para continuar"
        submitLabel="Entrar"
        isSubmitting={isSubmitting}
        error={firebaseError}
        footer={{ text: "Não tem uma conta?", linkLabel: "Cadastre-se grátis", to: "/register" }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <AuthTextField
          label="E-mail"
          type="email"
          placeholder="Digite seu e-mail"
          fullWidth
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: "#9ca3af", fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <PasswordField
          label="Senha"
          registration={register("password")}
          error={errors.password?.message}
        />
      </AuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
