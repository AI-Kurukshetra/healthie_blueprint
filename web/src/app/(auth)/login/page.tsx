import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="rounded-2xl bg-white shadow-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center text-2xl">Sign in to CareSync</CardTitle>
          <CardDescription className="text-center">Secure access to your care operations platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
