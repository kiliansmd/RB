'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, List } from 'lucide-react';

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-950">
          CV-Portal
          </Link>
          
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/'
                ? 'bg-achieve-ka text-white'
                : 'text-gray-950 hover:bg-gray-50'
              }`}
            >
            Alle Kandidaten
          </Link>
          <Link 
            href="/upload" 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/upload' 
                ? 'bg-achieve-ka text-white'
                : 'text-gray-950 hover:bg-gray-50'
            }`}
          >
            CV hochladen
            </Link>
            <Link
              href="/resumes"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/resumes'
                ? 'bg-achieve-ka text-white'
                : 'text-gray-950 hover:bg-gray-50'
              }`}
            >
              View Resumes
            </Link>
          </nav>
      </div>
    </header>
  );
}; 