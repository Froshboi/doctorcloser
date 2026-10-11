import { signUpAction } from "@/src/lib/auth-actions";
import { AuthForm } from "@/src/components/auth-form";

export default function SignUpPage() {
  return <AuthForm mode="signup" action={signUpAction} />;
}
