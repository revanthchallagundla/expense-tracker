'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Hand } from 'lucide-react';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  SignOutButton,
  ClerkLoaded,
  ClerkLoading,
} from '@clerk/nextjs';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav
      className="sticky top-0 z-50
                 bg-inherit text-inherit
                 border-b border-slate-200 dark:border-slate-700
                 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group transition-all duration-300 hover:scale-105"
              onClick={closeMobileMenu}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                <span className="text-white text-xs sm:text-sm md:text-lg font-bold">💰</span>
              </div>
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                <span className="hidden sm:inline">ExpenseTracker AI</span>
                <span className="sm:hidden">ExpenseTracker</span>
              </span>
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="relative bg-inherit text-inherit hover:!text-emerald-600 dark:hover:!text-emerald-400 px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 group"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            <Link
              href="/about"
              className="relative bg-inherit text-inherit hover:!text-emerald-600 dark:hover:!text-emerald-400 px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 group"
            >
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            <Link
              href="/contact"
              className="relative bg-inherit text-inherit hover:!text-emerald-600 dark:hover:!text-emerald-400 px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 group"
            >
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Auth controls (desktop) – render only after mount + Clerk loaded */}
            <div className="hidden sm:block">
              {hasMounted ? (
                <>
                  <ClerkLoading>
                    <div className="h-8 w-20 rounded-md bg-gray-200/60 dark:bg-gray-700/60 animate-pulse" />
                  </ClerkLoading>
                  <ClerkLoaded>
                    <SignedOut>
                      <SignInButton>
                        <button className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                          <div className="relative z-10 flex items-center cursor-pointer gap-1 sm:gap-2">
                            <Hand className="w-5 h-5 text-gray-200 transition-all duration-300" />
                            <span>Sign In</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        </button>
                      </SignInButton>
                    </SignedOut>

                    <SignedIn>
                      <div className="p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-100/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30 flex items-center gap-2">
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox:
                                'w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform duration-200',
                              userButtonBox: 'flex items-center justify-center',
                            },
                          }}
                          afterSignOutUrl="/"
                        />
                        <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
                          <button
                            className="hidden md:inline-flex bg-inherit text-inherit border border-emerald-300/60 dark:border-emerald-700/60 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                            aria-label="Sign out"
                          >
                            Sign out
                          </button>
                        </SignOutButton>
                      </div>
                    </SignedIn>
                  </ClerkLoaded>
                </>
              ) : (
                <div className="h-8 w-20 rounded-md bg-gray-200/60 dark:bg-gray-700/60" />
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl !text-gray-700 dark:!text-gray-300 hover:!text-emerald-600 dark:hover:!text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 active:scale-95"
              aria-label="Toggle mobile menu"
            >
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
                  isMobileMenuOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 pb-3 sm:pb-4' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 rounded-xl border border-gray-300 dark:border-gray-600 mt-2 shadow-lg">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-inherit text-inherit hover:!text-emerald-600 dark:hover:!text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold transition-all duration-200 active:scale-95"
              onClick={closeMobileMenu}
            >
              <span className="text-base">🏠</span>
              <span>Home</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-inherit text-inherit hover:!text-emerald-600 dark:hover:!text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold transition-all duration-200 active:scale-95"
              onClick={closeMobileMenu}
            >
              <span className="text-base">ℹ️</span>
              <span>About</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-inherit text-inherit hover:!text-emerald-600 dark:hover:!text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold transition-all duration-200 active:scale-95"
              onClick={closeMobileMenu}
            >
              <span className="text-base">📞</span>
              <span>Contact</span>
            </Link>

            {/* Mobile auth – also gated */}
            <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
              {hasMounted ? (
                <>
                  <ClerkLoading>
                    <div className="h-10 w-full rounded-xl bg-gray-200/60 dark:bg-gray-700/60 animate-pulse" />
                  </ClerkLoading>
                  <ClerkLoaded>
                    <SignedOut>
                      <SignInButton>
                        <button
                          onClick={closeMobileMenu}
                          className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                        >
                          <span>Sign In</span>
                        </button>
                      </SignInButton>
                    </SignedOut>

                    <SignedIn>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-emerald-100/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30">
                          <UserButton
                            appearance={{
                              elements: {
                                avatarBox: 'w-8 h-8 hover:scale-110 transition-transform duration-200',
                                userButtonBox: 'flex items-center justify-center',
                              },
                            }}
                            afterSignOutUrl="/"
                          />
                        </div>
                        <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
                          <button
                            onClick={closeMobileMenu}
                            className="w-full bg-white/70 dark:bg-gray-800/70 border border-emerald-200/50 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                          >
                            Sign out
                          </button>
                        </SignOutButton>
                      </div>
                    </SignedIn>
                  </ClerkLoaded>
                </>
              ) : (
                <div className="h-10 w-full rounded-xl bg-gray-200/60 dark:bg-gray-700/60" />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
