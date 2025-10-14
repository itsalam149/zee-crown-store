'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { User, Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export default function SignUpPage() {
    const supabase = createClient();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Creating account...');
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (error) {
            setLoading(false);
            toast.dismiss(toastId);
            toast.error(error.message);
        } else if (data.user) {
            await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName });
            setLoading(false);
            toast.dismiss(toastId);
            toast.success('Account created! Please check your email to verify.');
            router.push('/login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-grayBG">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-medium">
                <div className="text-center">
                    <Image src="/icon.png" alt="Zee Crown Logo" width={50} height={50} className="mx-auto" />
                    <h1 className="mt-4 text-2xl font-bold text-dark-gray">Create an Account</h1>
                    <p className="text-gray">Start your journey with Zee Crown.</p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Full Name" required />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Email address" required />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Password (min. 6 characters)" minLength={6} required />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
                <p className="text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}