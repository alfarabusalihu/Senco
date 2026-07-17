'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon } from 'lucide-react';

interface NavLinkProps {
  href: string;
  label: string;
  Icon: LucideIcon;
}

export function NavLink({ href, label, Icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <Icon
        className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
          isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-600'
        }`}
      />
      {label}
    </Link>
  );
}
