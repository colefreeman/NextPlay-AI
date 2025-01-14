import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home,
  Users,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-black text-gray-200"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Floating Sidebar */}
      <div
        className={`fixed inset-y-4 left-4 z-40 transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-black rounded-xl shadow-2xl shadow-black/30
          flex flex-col
          ${!sidebarOpen && 'items-center'}
          h-[calc(100vh-2rem)]
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-md bg-gray-800 text-gray-200"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-8 bg-blue-600 rounded-full p-1.5 text-white hover:bg-blue-700 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Sidebar content */}
        <div className="flex flex-col h-full py-8 px-4">
          <div className="flex items-center justify-center mb-8">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-gray-300 
                  hover:bg-gray-800 hover:text-white transition-colors
                  ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
              >
                <Icon className="h-6 w-6" />
                {sidebarOpen && <span className="ml-3">{label}</span>}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-gray-800">
            <button
              onClick={logout}
              className={`w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 
                rounded-lg hover:bg-blue-700 transition-colors
                ${sidebarOpen ? 'text-center' : 'px-2'}`}
            >
              {sidebarOpen ? 'Logout' : '←'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-28'}
          min-h-screen p-4 lg:p-8`}
      >
        {/* Top bar */}
        <div className="flex justify-end mb-8 bg-black/40 p-4 rounded-xl">
          <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <Bell className="h-6 w-6 text-gray-300" />
          </button>
        </div>

        {/* Content area */}
        <div className="bg-black/40 rounded-xl p-6 w-full max-w-4xl mx-auto h-[450px]">  {/* Adjust h-[800px] to your desired height */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
            {/* Your content will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;