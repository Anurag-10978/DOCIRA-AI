import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface RegisterForm {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      setError('');
      await registerUser({ email: data.email, full_name: data.full_name, password: data.password });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="ambient-scene" aria-hidden="true" />
      <div className="app-content w-full flex items-center justify-center relative z-10">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-accent-secondary/10 rounded-full blur-3xl pointer-events-none" />

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

          <div className="glass-card rounded-xl3 p-8">
            <h2 className="text-lg font-bold text-text-primary mb-1">Create workspace</h2>
            <p className="text-sm text-text-muted mb-6">Set up your document intelligence hub</p>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Jason Chen"
                icon={<User size={14} />}
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Full name is required' })}
              />
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
                placeholder="Min. 8 characters"
                icon={<Lock size={14} />}
                error={errors.password?.message}
                {...register('password', { required: true, minLength: { value: 8, message: 'Minimum 8 characters' } })}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                icon={<Lock size={14} />}
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  required: true,
                  validate: v => v === password || 'Passwords do not match'
                })}
              />
              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};