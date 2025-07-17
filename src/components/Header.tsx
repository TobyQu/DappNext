"use client";
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 导航项目
  const navItems = [
    { name: '首页', path: '/' },
    { name: '代币', path: '/token' },
    { name: '高级代币', path: '/advanced-token' },
    { name: '代币市场', path: '/market' },
  ];

  // 判断链接是否活跃
  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!mounted) {
    return (
      <header className="w-full border-b border-gray-200 bg-white py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold">Web3</div>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <div key={item.path} className="h-6 w-16 rounded bg-gray-200"></div>
              ))}
            </nav>
          </div>
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
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold">Web3</div>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
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