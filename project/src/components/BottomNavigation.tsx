import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function BottomNavigation() {
  const location = useLocation();
  const { user, isGuest } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/buy', icon: Search, label: 'Купить' },
    { path: '/sell', icon: Plus, label: 'Продать' },
    { path: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}