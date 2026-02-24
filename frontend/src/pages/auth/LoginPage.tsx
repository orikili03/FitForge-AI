import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../domains/auth/hooks';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui';

const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await loginMutation.mutateAsync(data);
            navigate('/');
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-ds-bg px-4">
            <div className="w-full max-w-md space-y-8 bg-ds-surface p-8 rounded-ds-xl shadow-ds-lg">
                <div className="text-center">
                    <h1 className="text-ds-title font-bold text-ds-text">Welcome Back</h1>
                    <p className="mt-2 text-ds-body-sm text-ds-text-muted">
                        Log in to continue your training
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-ds-caption font-medium text-ds-text-secondary">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email')}
                                className={cn(
                                    "mt-1 block w-full rounded-ds-md border border-ds-border bg-ds-bg-subtle px-3 py-2 text-ds-text placeholder-ds-text-faint focus:border-ds-accent focus:outline-none focus:ring-1 focus:ring-ds-accent",
                                    errors.email && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                )}
                                placeholder="coach@wodlab.ai"
                            />
                            {errors.email && (
                                <p className="mt-1 text-ds-caption text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-ds-caption font-medium text-ds-text-secondary">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                {...register('password')}
                                className={cn(
                                    "mt-1 block w-full rounded-ds-md border border-ds-border bg-ds-bg-subtle px-3 py-2 text-ds-text placeholder-ds-text-faint focus:border-ds-accent focus:outline-none focus:ring-1 focus:ring-ds-accent",
                                    errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                )}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-ds-caption text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={loginMutation.isPending}
                        >
                            Sign In
                        </Button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-ds-caption text-ds-text-muted">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/auth/register')}
                            className="font-medium text-ds-accent hover:text-ds-accent-hover transition-colors"
                        >
                            Register now
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

