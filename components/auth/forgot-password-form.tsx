import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Form, FormField, FormSubmitButton, createValidationRules, emailPattern } from "@/lib/forms";
import Link from "next/link";

interface ForgotPasswordFormValues extends Record<string, unknown> {
  email: string;
}

export const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: '' },
    onSubmit: async (values) => {
      console.log('Forgot password values:', values);
      // Handle forgot password logic here
    }
  });

  return (
    <div className="w-full max-w-md">
      <Card className="rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form<ForgotPasswordFormValues> onSubmit={form.handleSubmit}>
            <div className="space-y-4">
              <form.Field
                name="email"
                validators={createValidationRules<string>({
                  required: true,
                  pattern: emailPattern
                })}
              >
                {(field) => (
                  <FormField<ForgotPasswordFormValues>
                    field={field}
                    name="email"
                    label="Email"
                    placeholder="your@email.com"
                    required
                    error={field.state.meta.errors[0]}
                  />
                )}
              </form.Field>
              
              <FormSubmitButton className="w-full rounded-xl" size="lg">
                Send reset link
              </FormSubmitButton>
            </div>
          </Form>

          <div className="text-center space-y-2">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </Link>
            <br />
            <Link
              href="/auth/signup"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By using TheDial you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>
        ,{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        , and{" "}
        <Link href="/security" className="underline hover:text-foreground">
          Security Policy
        </Link>
        .
      </p>
    </div>
  );
};
