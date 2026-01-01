'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <LoginForm />
        </div>
      </div>
    </AuthProvider>
  );
}

