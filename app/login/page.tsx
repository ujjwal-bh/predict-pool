'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/app/components/auth-form';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (data: { email: string; password: string }) => {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    router.push('/dashboard');
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
}
