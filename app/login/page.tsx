// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Signing in...');
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        toast.dismiss(toastId);

        if (error) {
            if (error.message.includes('Email not confirmed')) {
                toast.error('Email not verified. Please check your inbox for an OTP.');
                // Redirect to OTP page so they can verify
                router.push(`/verify-otp?email=${encodeURIComponent(email)}&otpType=signup`);
            } else if (error.message.includes('Invalid login credentials')) {
                toast.error('Invalid email or password.');
            } else {
                toast.error(error.message);
            }
            setLoading(false);
        } else {
            toast.success('Signed in successfully!');
            router.push('/');
            router.refresh();
            // No need to set loading false, we are redirecting
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-grayBG">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-medium">
                <div className="text-center">
                    <Image src="/icon.png" alt="Zee Crown Logo" width={50} height={50} className="mx-auto" />
                    <h1 className="mt-4 text-2xl font-bold text-dark-gray">Welcome Back</h1>
                    <p className="text-gray">Sign in to continue to Zee Crown.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Email address" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Password" required />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right text-sm">
                        <Link href="/forgot-password"
                            className="font-semibold text-primary hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>
                <p className="text-center text-sm">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}