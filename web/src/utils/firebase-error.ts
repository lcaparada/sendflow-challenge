import { FirebaseError } from "firebase/app";

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return "Sem permissão para realizar esta operação.";
      case "not-found":
        return "Documento não encontrado.";
      case "already-exists":
        return "Este registro já existe.";
      case "unavailable":
        return "Serviço indisponível. Verifique sua conexão.";
      case "unauthenticated":
        return "Sessão expirada. Faça login novamente.";
      case "resource-exhausted":
        return "Limite de requisições atingido. Tente novamente em instantes.";
      case "auth/email-already-in-use":
        return "Este e-mail já está em uso.";
      case "auth/invalid-credential":
        return "E-mail ou senha inválidos.";
      case "auth/too-many-requests":
        return "Muitas tentativas. Tente novamente mais tarde.";
      case "auth/weak-password":
        return "A senha é muito fraca. Use no mínimo 6 caracteres.";
      default:
        return "Ocorreu um erro inesperado. Tente novamente.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}
