import React, { useState } from 'react';
import { supabase } from '../../supabase/client';
import Icon from '../Icon';
import { ICONS } from '../../constants';

type AuthMode = 'signIn' | 'signUp';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'signIn') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Account created! Please check your email for verification.');
    }
    
    setLoading(false);
  };

  const toggleMode = () => {
    setMode(prev => prev === 'signIn' ? 'signUp' : 'signIn');
    setError('');
    setMessage('');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="flex flex-col items-center">
          <Icon path={ICONS.LOGO} className="h-12 w-12 text-slate-800" />
          <h1 className="text-2xl font-bold mt-2 text-slate-800">Welcome to RateMaster</h1>
          <p className="text-slate-500">{mode === 'signIn' ? 'Sign in to access your dashboard' : 'Create an account to get started'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:bg-slate-400"
          >
            {loading ? 'Processing...' : (mode === 'signIn' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {message && <p className="text-sm text-center text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}
        {error && <p className="text-sm text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

        <p className="text-sm text-center text-slate-500">
            {mode === 'signIn' ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleMode} className="font-semibold text-slate-800 hover:underline ml-1">
                {mode === 'signIn' ? 'Sign Up' : 'Sign In'}
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
