import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      await login(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="ambient-scene" aria-hidden="true" />
      <div className="app-content w-full flex items-center justify-center relative z-10">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm mx-4 fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent-gradient flex items-center justify-center shadow-accent mb-4">
              <img
                src="/docira-logo.svg"
                alt="DOCIRA-AI"
                className="w-8 h-8"
              />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">DOCIRA-AI</h1>
            <p className="text-sm text-text-muted mt-1">Enterprise Document Intelligence</p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-xl3 p-8">
            <h2 className="text-lg font-bold text-text-primary mb-1">Welcome back</h2>
            <p className="text-sm text-text-muted mb-6">Sign in to your workspace</p>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                icon={<Mail size={14} />}
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={14} />}
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              No account?{' '}
              <Link to="/register" className="text-accent hover:text-accent/80 font-medium transition-colors">
                Create workspace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};