import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Form, FormField, FormSubmitButton, emailPattern } from "@/lib/forms";
import { GoogleAuthButton, AuthDivider } from "./auth-components";
import { PasswordField } from "@/components/ui/password-field";
import Link from "next/link";

interface LoginFormValues extends Record<string, unknown> {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const form = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    onSubmit: async (values) => {
      console.log('Login values:', values);
      // Handle login logic here
    }
  });

  return (
    <div className="w-full max-w-md">
      <Card className="rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign into your account</CardTitle>
          <CardDescription>
            Automatically record, transcribe, and organize your business calls using AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Login */}
          <GoogleAuthButton />

          <AuthDivider />

          {/* Email/Password Form */}
          <Form<LoginFormValues> onSubmit={form.handleSubmit}>
            <div className="space-y-4">
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const stringValue = String(value || '');
                    if (!stringValue || stringValue.trim() === '') return 'This field is required';
                    if (!emailPattern.test(stringValue)) return 'Invalid email format';
                    return undefined;
                  },
                  onBlur: ({ value }) => {
                    const stringValue = String(value || '');
                    if (!stringValue || stringValue.trim() === '') return 'This field is required';
                    if (!emailPattern.test(stringValue)) return 'Invalid email format';
                    return undefined;
                  }
                }}
              >
                {(field) => (
                  <FormField
                    field={field}
                    name="email"
                    label="Email Address"
                    placeholder="Email"
                    required
                    error={!field.state.meta.isValid ? field.state.meta.errors.join(', ') : undefined}
                  />
                )}
              </form.Field>
              
              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    const stringValue = String(value || '');
                    if (!stringValue || stringValue.trim() === '') return 'This field is required';
                    return undefined;
                  },
                  onBlur: ({ value }) => {
                    const stringValue = String(value || '');
                    if (!stringValue || stringValue.trim() === '') return 'This field is required';
                    return undefined;
                  }
                }}
              >
                {(field) => (
                  <PasswordField
                    id={field.name}
                    value={field.state.value as string}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    label="Password"
                    placeholder="Your password"
                    required
                    error={!field.state.meta.isValid ? field.state.meta.errors.join(', ') : undefined}
                  />
                )}
              </form.Field>
              
              <FormSubmitButton className="w-full rounded-xl" size="lg">
                Sign in
              </FormSubmitButton>
            </div>
          </Form>

          <div className="text-center space-y-2">
            <Link
              href="/auth/signup"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Don&apos;t have an account? Sign up
            </Link>
            <br />
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By using Dialer you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};
