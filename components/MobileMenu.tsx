import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { NavigationItem } from '@/types/kandidat';
import Link from 'next/link';

interface MobileMenuProps {
  navSections: NavigationItem[];
  kandidatName?: string;
}

export function MobileMenu({ navSections, kandidatName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navSections.map((section) => (
            <Link
              key={section.id}
              href={`#${section.id}`}
              className="text-lg font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {section.label}
            </Link>
          ))}
        </nav>
        {kandidatName && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-950">Aktuelles Profil</p>
            <p className="font-medium text-lg">{kandidatName}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 