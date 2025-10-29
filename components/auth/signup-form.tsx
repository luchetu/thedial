import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Form, FormField, FormSubmitButton, emailPattern, passwordPattern } from "@/lib/forms";
import { GoogleAuthButton, AuthDivider } from "./auth-components";
import { PasswordField } from "@/components/ui/password-field";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface SignupFormValues extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  recordingConsent: boolean;
}

export const SignupForm = () => {
  const form = useForm<SignupFormValues>({
    defaultValues: { 
      firstName: '', 
      lastName: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      recordingConsent: false 
    },
    onSubmit: async (values) => {
      console.log('Signup values:', values);
      // Handle signup logic here
    }
  });

  return (
    <div className="w-full max-w-md">
      <Card className="rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>
            Start recording and transcribing your calls in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Signup */}
          <GoogleAuthButton />

          <AuthDivider />

          {/* Signup Form */}
          <Form<SignupFormValues> onSubmit={form.handleSubmit}>
            <div className="space-y-4">
              {/* First Name and Last Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="firstName"
                  validators={{
                    onChange: ({ value }) => {
                      const stringValue = String(value || '');
                      if (!stringValue || stringValue.trim() === '') return 'This field is required';
                      if (stringValue.length < 2) return 'Must be at least 2 characters';
                      return undefined;
                    },
                    onBlur: ({ value }) => {
                      const stringValue = String(value || '');
                      if (!stringValue || stringValue.trim() === '') return 'This field is required';
                      if (stringValue.length < 2) return 'Must be at least 2 characters';
                      return undefined;
                    }
                  }}
                >
                  {(field) => (
                    <FormField
                      field={field}
                      name="firstName"
                      label="First Name"
                      placeholder="Humphrey"
                      required
                      error={!field.state.meta.isValid ? field.state.meta.errors.join(', ') : undefined}
                    />
                  )}
                </form.Field>

                <form.Field
                  name="lastName"
                  validators={{
                    onChange: ({ value }) => {
                      const stringValue = String(value || '');
                      if (!stringValue || stringValue.trim() === '') return 'This field is required';
                      if (stringValue.length < 2) return 'Must be at least 2 characters';
                      return undefined;
                    },
                    onBlur: ({ value }) => {
                      const stringValue = String(value || '');
                      if (!stringValue || stringValue.trim() === '') return 'This field is required';
                      if (stringValue.length < 2) return 'Must be at least 2 characters';
                      return undefined;
                    }
                  }}
                >
                  {(field) => (
                    <FormField
                      field={field}
                      name="lastName"
                      label="Last Name"
                      placeholder="Smith"
                      required
                      error={!field.state.meta.isValid ? field.state.meta.errors.join(', ') : undefined}
                    />
                  )}
                </form.Field>
              </div>
              
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
                    if (!passwordPattern.test(stringValue)) return 'Password must contain at least 8 characters with uppercase, lowercase, and number';
                    return undefined;
                  },
                  onBlur: ({ value }) => {
                    const stringValue = String(value || '');
                    if (!stringValue || stringValue.trim() === '') return 'This field is required';
                    if (!passwordPattern.test(stringValue)) return 'Password must contain at least 8 characters with uppercase, lowercase, and number';
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
                    placeholder="Create a password"
                    required
                    error={!field.state.meta.isValid ? field.state.meta.errors.join(', ') : undefined}
                  />
                )}
              </form.Field>

              <form.Field
                name="confirmPassword"
                validators={{
                  onChange: ({ value }) => {
                    const stringValue = String(value || '');
                    const password = form.getFieldValue('password');
                    if (!stringValue || stringValue.trim() === '') return 'This field is required';
                    if (stringValue !== password) return 'Passwords do not match';
                    return undefined;
                  },
                  onBlur: ({ value }) => {
                    const stringValue = String(value || '');
                    const password = form.getFieldValue('password');
                    if (!stringValue || stringValue.trim() === '') return 'This field is required';
                    if (stringValue !== password) return 'Passwords do not match';
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
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    required
                    error={!field.state.meta.isValid ? field.state.meta.errors.join(', ') : undefined}
                  />
                )}
              </form.Field>

              <form.Field
                name="recordingConsent"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'You must agree to recording and privacy terms';
                    return undefined;
                  },
                  onBlur: ({ value }) => {
                    if (!value) return 'You must agree to recording and privacy terms';
                    return undefined;
                  }
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={field.name}
                        checked={field.state.value as boolean}
                        onCheckedChange={(checked) => field.handleChange(checked)}
                        onBlur={field.handleBlur}
                      />
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Recording & Privacy Consent
                        <span className="text-destructive">*</span>
                      </label>
                    </div>
                    {!field.state.meta.isValid && (
                      <p className="text-sm text-destructive" role="alert">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
              
              <FormSubmitButton className="w-full rounded-xl" size="lg">
                Create account
              </FormSubmitButton>
            </div>
          </Form>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By creating an account, you agree to Dialer&apos;s{" "}
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
