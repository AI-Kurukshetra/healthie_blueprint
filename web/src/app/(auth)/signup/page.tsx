import { SignupForm } from "@/components/auth/SignupForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="rounded-2xl bg-white shadow-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center text-2xl">Create your CareSync account</CardTitle>
          <CardDescription className="text-center">Get started with secure virtual care workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
