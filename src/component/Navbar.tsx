import { useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom'; // For navigation
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext
import pic1 from "../assets/pic1.png";
import logo from "../assets/logo.png";

const navigationItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Profile', href: '/profile' },
  { name: 'Developed By', href: 'https://abhishekoraon-com.vercel.app/' },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export default function NavbarComponent() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentTab, setCurrentTab] = useState('/');

  const handleLogout = async () => {
    try {
      const response = await fetch(`https://taskmanagement-backend-uxtd.onrender.com/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        logout();
        navigate('/login');
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleTabClick = (href: string) => {
    if (href.startsWith('http')) {
      window.open(href, '_blank'); // Open external link in a new tab
    } else {
      setCurrentTab(href);
      navigate(href);
    }
  };
  

  return (
    <Disclosure as="nav" className="bg-gray-800 fixed top-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img alt="Your Company" src={logo} className="h-8 w-auto" />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleTabClick(item.href)}
                    className={classNames(
                      currentTab === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium'
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white">
                  <span className="sr-only">Open user menu</span>
                  <img alt="" src={pic1} className="size-8 rounded-full" />
                </MenuButton>
              </div>
              <MenuItems
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
              >
                <MenuItem>
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </a>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100 focus:outline-none"
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigationItems.map((item) => (
            <DisclosureButton
              key={item.name}
              as="button"
              onClick={() => handleTabClick(item.href)}
              className={classNames(
                currentTab === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium'
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
