import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../../domains/auth/hooks';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(6, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerMutation.mutateAsync({
                email: data.email,
                password: data.password,
            });
            navigate('/');
        } catch (err) {
            console.error('Registration failed', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-ds-bg px-4">
            <div className="w-full max-w-md space-y-8 bg-ds-surface p-8 rounded-ds-xl shadow-ds-lg">
                <div className="text-center">
                    <h1 className="text-ds-title font-bold text-ds-text">Join WODLab</h1>
                    <p className="mt-2 text-ds-body-sm text-ds-text-muted">
                        Create an account to start your journey
                    </p>
                </div>

                {registerMutation.isError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-ds-md p-3 text-ds-caption text-red-500 text-center">
                        {registerMutation.error.message}
                    </div>
                )}

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
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    {...register('password')}
                                    className={cn(
                                        "block w-full rounded-ds-md border border-ds-border bg-ds-bg-subtle pl-3 pr-10 py-2 text-ds-text placeholder-ds-text-faint focus:border-ds-accent focus:outline-none focus:ring-1 focus:ring-ds-accent",
                                        errors.password && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    )}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-ds-text-faint hover:text-ds-text-secondary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-ds-caption text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-ds-caption font-medium text-ds-text-secondary">
                                Confirm Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    {...register('confirmPassword')}
                                    className={cn(
                                        "block w-full rounded-ds-md border border-ds-border bg-ds-bg-subtle pl-3 pr-10 py-2 text-ds-text placeholder-ds-text-faint focus:border-ds-accent focus:outline-none focus:ring-1 focus:ring-ds-accent",
                                        errors.confirmPassword && "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    )}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-ds-text-faint hover:text-ds-text-secondary transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-ds-caption text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={registerMutation.isPending}
                        >
                            Create Account
                        </Button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-ds-caption text-ds-text-muted">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/auth/login')}
                            className="font-medium text-ds-accent hover:text-ds-accent-hover transition-colors"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

