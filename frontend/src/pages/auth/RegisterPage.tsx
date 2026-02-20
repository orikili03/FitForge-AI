import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../features/auth/authApi";
import { useAuthToken } from "../../hooks/useAuthToken";

interface RegisterFormValues {
  email: string;
  password: string;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
}

function passwordRules(password: string) {
  const value = password ?? "";
  return {
    minLength: value.length >= 8,
    hasLetter: /[A-Za-z]/.test(value),
    hasNumber: /[0-9]/.test(value),
  };
}

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      fitnessLevel: "beginner",
    },
    mode: "onChange",
  });
  const registerMutation = useRegister();
  const { setToken } = useAuthToken();
  const navigate = useNavigate();

  const password = watch("password") ?? "";
  const checks = useMemo(() => passwordRules(password), [password]);
  const passwordOk = checks.minLength && checks.hasLetter && checks.hasNumber;
  const passwordStarted = password.length > 0;

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(
      {
        email: values.email,
        password: values.password,
        fitnessLevel: values.fitnessLevel,
      },
      {
        onSuccess: (data) => {
          setToken(data.token);
          navigate("/");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ds-bg p-6">
      <div className="card w-full max-w-md">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ds-text">
            Create account
          </h1>
          <p className="text-sm text-ds-text-muted">
            Get started fast. You can fine-tune equipment and goals after signing up.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {registerMutation.isError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
              <p className="text-sm text-red-400">
                {registerMutation.error?.message ?? "Unable to create account. Please try again."}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ds-text">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-ds-border bg-ds-surface-subtle px-4 py-3 text-sm text-ds-text placeholder:text-ds-text-muted transition-colors duration-250 focus:border-ds-border-strong focus:outline-none focus:ring-1 focus:ring-ds-border-strong"
              {...register("email", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ds-text">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-ds-border bg-ds-surface-subtle px-4 py-3 text-sm text-ds-text placeholder:text-ds-text-muted transition-colors duration-250 focus:border-ds-border-strong focus:outline-none focus:ring-1 focus:ring-ds-border-strong"
              {...register("password", {
                required: true,
                validate: (value) => {
                  const rules = passwordRules(value ?? "");
                  const ok = rules.minLength && rules.hasLetter && rules.hasNumber;
                  return ok || "Password does not meet requirements";
                },
              })}
            />
            <div className="mt-2 space-y-1 text-xs">
              <div
                className={
                  checks.minLength
                    ? "text-emerald-400"
                    : passwordStarted
                      ? "text-red-400"
                      : "text-ds-text-muted"
                }
              >
                {checks.minLength ? "✓" : "•"} At least 8 characters
              </div>
              <div
                className={
                  checks.hasLetter
                    ? "text-emerald-400"
                    : passwordStarted
                      ? "text-red-400"
                      : "text-ds-text-muted"
                }
              >
                {checks.hasLetter ? "✓" : "•"} Includes a letter (A–Z)
              </div>
              <div
                className={
                  checks.hasNumber
                    ? "text-emerald-400"
                    : passwordStarted
                      ? "text-red-400"
                      : "text-ds-text-muted"
                }
              >
                {checks.hasNumber ? "✓" : "•"} Includes a number (0–9)
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ds-text">Fitness level</label>
            <select
              className="w-full rounded-xl border border-ds-border bg-ds-surface-subtle px-4 py-3 text-sm text-ds-text transition-colors duration-250 focus:border-ds-border-strong focus:outline-none focus:ring-1 focus:ring-ds-border-strong"
              {...register("fitnessLevel", { required: true })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={registerMutation.isPending || !isValid || !passwordOk}
          >
            {registerMutation.isPending ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-ds-text-muted">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-amber-400 transition-colors duration-250 hover:text-amber-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

