import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { UserAccount } from '../types';
import { PRESET_USERS } from '../data/seedVideos';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
  onLoginSuccess: (user: UserAccount) => void;
  darkMode: boolean;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin',
  onLoginSuccess,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  // Sign In state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up state
  const [signupName, setSignupName] = useState('');
  const [signupHandle, setSignupHandle] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupBio, setSignupBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Retrieve all stored registered accounts
  const getStoredAccounts = (): UserAccount[] => {
    try {
      const stored = localStorage.getItem('viewtube_registered_accounts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return PRESET_USERS;
  };

  const saveStoredAccounts = (accounts: UserAccount[]) => {
    localStorage.setItem('viewtube_registered_accounts', JSON.stringify(accounts));
  };

  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const iden = loginIdentifier.trim().toLowerCase();
    if (!iden) {
      setLoginError('Please enter your email or channel handle.');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Please enter your password.');
      return;
    }

    const accounts = getStoredAccounts();
    const found = accounts.find(
      (acc) =>
        acc.email?.toLowerCase() === iden ||
        acc.handle.toLowerCase() === iden ||
        acc.handle.toLowerCase() === `@${iden}` ||
        acc.name.toLowerCase() === iden
    );

    if (found) {
      const loggedUser: UserAccount = {
        ...found,
        isLoggedIn: true,
      };
      setSuccessToast(`Welcome back, ${loggedUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(loggedUser);
        onClose();
      }, 500);
    } else {
      // If user isn't in preset list, allow seamless demo sign-in with entered credentials!
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: loginIdentifier.includes('@') ? loginIdentifier.split('@')[0] : loginIdentifier,
        handle: loginIdentifier.startsWith('@') ? loginIdentifier : `@${loginIdentifier.replace(/\s+/g, '_').toLowerCase()}`,
        email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier.toLowerCase()}@viewtube.io`,
        avatarUrl: AVATAR_PRESETS[1],
        isLoggedIn: true,
        subscribedChannelIds: ['ch-blender', 'ch-lofi'],
        likedVideoIds: [],
        dislikedVideoIds: [],
        watchLaterIds: [],
        historyVideoIds: [],
        createdAt: 'Joined today',
      };
      const updated = [...accounts, newUser];
      saveStoredAccounts(updated);
      setSuccessToast(`Signed in as ${newUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
      }, 500);
    }
  };

  // One-Click Demo Login
  const handleQuickLogin = (preset: UserAccount) => {
    const loggedUser: UserAccount = {
      ...preset,
      isLoggedIn: true,
    };
    setSuccessToast(`Switched account to ${loggedUser.name}!`);
    setTimeout(() => {
      onLoginSuccess(loggedUser);
      onClose();
    }, 450);
  };

  // Sign Up Handler
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    const name = signupName.trim();
    if (!name) {
      setSignupError('Please provide your full name or channel title.');
      return;
    }

    let handle = signupHandle.trim();
    if (!handle) {
      handle = `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    } else if (!handle.startsWith('@')) {
      handle = `@${handle}`;
    }

    const email = signupEmail.trim();
    if (!email || !email.includes('@')) {
      setSignupError('Please provide a valid email address.');
      return;
    }

    if (signupPassword.length < 4) {
      setSignupError('Password must be at least 4 characters.');
      return;
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find(
      (a) => a.email?.toLowerCase() === email.toLowerCase() || a.handle.toLowerCase() === handle.toLowerCase()
    );

    if (existing) {
      setSignupError('An account with this email or handle already exists. Try signing in.');
      return;
    }

    const newAccount: UserAccount = {
      id: `user-${Date.now()}`,
      name,
      handle,
      email,
      bio: signupBio.trim() || 'New creator on ViewTube 🎬',
      avatarUrl: customAvatarUrl.trim() || selectedAvatar,
      isLoggedIn: true,
      subscribedChannelIds: ['ch-lofi', 'ch-blender'],
      likedVideoIds: [],
      dislikedVideoIds: [],
      watchLaterIds: [],
      historyVideoIds: [],
      createdAt: 'Joined just now',
    };

    const updated = [newAccount, ...accounts];
    saveStoredAccounts(updated);

    setSuccessToast(`Account created successfully! Welcome to ViewTube, ${name}.`);
    setTimeout(() => {
      onLoginSuccess(newAccount);
      onClose();
    }, 600);
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="auth-modal"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden relative transition-all ${
          darkMode ? 'bg-[#1e1e1e] text-white border-[#333333]' : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-neutral-700/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {activeTab === 'signin' ? 'Sign in to ViewTube' : 'Create your ViewTube Account'}
              </h2>
              <p className="text-xs text-neutral-400">
                {activeTab === 'signin'
                  ? 'Access your saved playlists, history, and channel'
                  : 'Start uploading, commenting, and going live'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-700/30">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setLoginError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'border-red-600 text-red-500 bg-red-600/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setSignupError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'border-red-600 text-red-500 bg-red-600/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Success Banner */}
        {successToast && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="p-6">
          {activeTab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Email or Handle
                </label>
                <div
                  className={`flex items-center px-3.5 h-10 rounded-xl border transition-colors ${
                    darkMode ? 'bg-[#121212] border-neutral-700' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <Mail className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. alex@viewtube.io or @alexrivera_studio"
                    className="w-full bg-transparent text-xs focus:outline-none placeholder:text-neutral-500"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    Password
                  </label>
                  <span className="text-[11px] text-neutral-500">demo: any password</span>
                </div>
                <div
                  className={`flex items-center px-3.5 h-10 rounded-xl border transition-colors ${
                    darkMode ? 'bg-[#121212] border-neutral-700' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <Lock className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs focus:outline-none placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-signin"
                className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick One-Click Demo Switcher */}
              <div className="pt-3 border-t border-neutral-700/30">
                <div className="text-[11px] text-neutral-400 font-medium mb-2">
                  Or sign in with 1-click demo accounts:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_USERS.slice(0, 2).map((user: UserAccount) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-colors cursor-pointer ${
                        darkMode
                          ? 'border-neutral-800 bg-[#252525] hover:bg-[#2e2e2e]'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{user.name}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{user.handle}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
              {signupError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Full Name / Channel Title *
                </label>
                <div
                  className={`flex items-center px-3.5 h-9 rounded-xl border transition-colors ${
                    darkMode ? 'bg-[#121212] border-neutral-700' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      if (!signupHandle) {
                        setSignupHandle(`@${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
                      }
                    }}
                    placeholder="e.g. Jordan Miller"
                    className="w-full bg-transparent text-xs focus:outline-none placeholder:text-neutral-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Channel Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupHandle}
                    onChange={(e) => setSignupHandle(e.target.value)}
                    placeholder="@jordan_m"
                    className={`w-full px-3 h-9 rounded-xl border text-xs focus:outline-none ${
                      darkMode ? 'bg-[#121212] border-neutral-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="jordan@viewtube.io"
                    className={`w-full px-3 h-9 rounded-xl border text-xs focus:outline-none ${
                      darkMode ? 'bg-[#121212] border-neutral-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className={`w-full px-3 h-9 rounded-xl border text-xs focus:outline-none ${
                    darkMode ? 'bg-[#121212] border-neutral-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Bio / Channel Description
                </label>
                <textarea
                  rows={2}
                  value={signupBio}
                  onChange={(e) => setSignupBio(e.target.value)}
                  placeholder="Tell viewers what you stream or create..."
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none ${
                    darkMode ? 'bg-[#121212] border-neutral-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt={`Avatar preset ${idx + 1}`}
                      onClick={() => {
                        setSelectedAvatar(av);
                        setCustomAvatarUrl('');
                      }}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer transition-all ${
                        selectedAvatar === av && !customAvatarUrl
                          ? 'ring-2 ring-red-500 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-signup"
                className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer mt-2"
              >
                <span>Create ViewTube Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
