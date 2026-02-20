import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../../features/auth/authApi";
import { useAuthToken } from "../../contexts/AuthTokenContext";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const loginMutation = useLogin();
  const { setToken } = useAuthToken();
  const navigate = useNavigate();

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        setToken(data.token);
        // Defer navigation so the auth context update commits before the route change.
        // Fixes production where batching could make PrivateRoute mount with stale token.
        setTimeout(() => navigate("/"), 0);
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ds-bg p-6">
      <div className="card w-full max-w-md">
        <div className="space-y-1 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ds-text">
            Sign in
          </h1>
          <p className="text-sm text-ds-text-muted">
            Log into FitForge AI to generate adaptive CrossFit WODs.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ds-text">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-ds-border bg-ds-surface-subtle px-4 py-3 text-sm text-ds-text placeholder:text-ds-text-muted transition-colors duration-250 focus:border-ds-border-strong focus:outline-none focus:ring-1 focus:ring-ds-border-strong"
              {...register("email", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ds-text">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-ds-border bg-ds-surface-subtle px-4 py-3 text-sm text-ds-text placeholder:text-ds-text-muted transition-colors duration-250 focus:border-ds-border-strong focus:outline-none focus:ring-1 focus:ring-ds-border-strong"
              {...register("password", { required: true })}
            />
          </div>
          {loginMutation.isError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
              <p className="text-sm text-red-400">
                {loginMutation.error?.message ?? "Unable to sign in. Please try again."}
              </p>
              {loginMutation.error?.message?.includes("No account") && (
                <p className="mt-1 text-sm text-ds-text-muted">
                  <Link
                    to="/auth/register"
                    className="font-medium text-amber-400 hover:text-amber-300"
                  >
                    Create an account
                  </Link>
                </p>
              )}
            </div>
          )}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-sm text-ds-text-muted">
          No account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-amber-400 transition-colors duration-250 hover:text-amber-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

