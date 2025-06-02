import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="bg-gray-50 border-b border-gray-200 py-3"
    >
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              href="/" 
              className="text-gray-950 hover:text-gray-950 flex items-center"
            >
              <Home className="w-4 h-4 mr-1" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-950 mx-2" />
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-gray-950 hover:text-gray-950"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-950 font-medium">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
} 