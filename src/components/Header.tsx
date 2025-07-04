"use client";
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="w-full border-b border-gray-200 bg-white py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="text-2xl font-bold">Web3 DApp</div>
          <div className="wallet">
            <div className="h-10 w-36 rounded-md bg-gray-200"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="text-2xl font-bold">Web3 DApp</div>
        <div className="wallet">
          <ConnectButton
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
          />
        </div>
      </div>
    </header>
  );
} 