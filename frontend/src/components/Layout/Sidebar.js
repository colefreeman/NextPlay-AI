// src/components/Layout/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
 Home,
 Users, 
 Compass, 
 PlusSquare,
 User,
 Calendar,
 Trophy,
 Settings
} from 'lucide-react';

const Sidebar = () => {
 const location = useLocation();

 const navItems = [
   { path: '/dashboard', icon: Home, label: 'Dashboard' },
   { path: '/feed', icon: Users, label: 'Feed' },
   { path: '/explore', icon: Compass, label: 'Explore' },
   { path: '/create-post', icon: PlusSquare, label: 'Create Post' },
   { path: '/profile', icon: User, label: 'Profile' },
   { path: '/events', icon: Calendar, label: 'Events' },
   { path: '/achievements', icon: Trophy, label: 'Achievements' }
 ];

 const isActive = (path) => location.pathname === path;

 return (
   <div className="w-64 bg-[#1a1a1a] text-white h-screen fixed left-0 border-r border-gray-700">
     <div className="py-6 px-4">
       <div className="space-y-2">
         {navItems.map((item) => (
           <Link
             key={item.path}
             to={item.path}
             className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
               ${isActive(item.path) 
                 ? 'bg-blue-600 text-white' 
                 : 'text-gray-300 hover:bg-gray-800'}`}
           >
             <item.icon size={20} />
             <span>{item.label}</span>
           </Link>
         ))}
       </div>

       {/* Settings at bottom */}
       <div className="absolute bottom-8 w-full left-0 px-4">
         <Link
           to="/settings"
           className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
         >
           <Settings size={20} />
           <span>Settings</span>
         </Link>
       </div>
     </div>
   </div>
 );
};

export default Sidebar;