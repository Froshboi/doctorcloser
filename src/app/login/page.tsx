import { signInAction } from "@/src/lib/auth-actions";
import { AuthForm } from "@/src/components/auth-form";

export default function LoginPage() {
  return <AuthForm mode="login" action={signInAction} />;
}
