import { useState } from "react";
import { InputAdornment } from "@mui/material";
import { Email, PersonAdd } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerUser } from "./auth.service";
import { registerSchema, type RegisterSchemaType } from "..";
import {
  AuthCard,
  AuthLayout,
  AuthTextField,
  PasswordField,
} from "../../components";
import { getFirebaseErrorMessage } from "../../utils";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterSchemaType) => {
    setFirebaseError("");
    try {
      await registerUser(data.email, data.password);
      navigate("/connections");
    } catch (err) {
      setFirebaseError(getFirebaseErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      panel={{
        icon: <PersonAdd sx={{ fontSize: 40, color: "white" }} />,
        title: "Crie sua conta",
        subtitle:
          "Comece agora a gerenciar suas conexões e disparos de mensagens",
        features: [
          "Cadastro gratuito",
          "Acesso imediato",
          "Dados isolados por conta",
        ],
      }}
    >
      <AuthCard
        title="Criar conta"
        subtitle="Preencha os dados para começar"
        submitLabel="Cadastrar"
        isSubmitting={isSubmitting}
        error={firebaseError}
        footer={{
          text: "Já tem uma conta?",
          linkLabel: "Entrar",
          to: "/login",
        }}
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
          helperText="Mínimo de 6 caracteres"
        />
        <PasswordField
          label="Confirmar senha"
          registration={register("confirm")}
          error={errors.confirm?.message}
        />
      </AuthCard>
    </AuthLayout>
  );
}
