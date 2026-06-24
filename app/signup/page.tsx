'use client';

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/app/components/auth-form';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (data: { email: string; password: string; name: string }) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }

    // Auto login after signup
    const loginResult = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (loginResult?.error) {
      throw new Error(loginResult.error);
    }

    router.push('/dashboard');
  };

  return <AuthForm type="signup" onSubmit={handleSignup} />;
}
