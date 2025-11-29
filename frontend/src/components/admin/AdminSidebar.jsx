import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, FolderKanban, Layers, UserCircle, Shield, BarChart3, Download, Award, Settings, Palette, X } from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose, onNavigate, continuingEvent }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('criteria');

  const handleNavigation = (path, itemId) => {
    setActiveItem(itemId);
    if (onNavigate) {
      onNavigate(path || itemId);
    } else if (path) {
      navigate(path);
    }
    // Don't close sidebar when opening modals
    if (itemId !== 'judges-modal' && itemId !== 'event-details' && itemId !== 'theme' && itemId !== 'settings') {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full min-h-screen w-72 flex-col gap-4 border-r border-white/30 bg-white/70 p-4 text-gray-800 shadow-xl backdrop-blur-2xl z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center group shadow-sm"
        >
          <X size={10} className="text-red-900 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
        </button>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            className="w-full h-10 bg-white/50 border border-gray-300/50 rounded-lg pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            placeholder="Search"
            type="search"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-6 mt-2 overflow-y-auto">
          {/* Event Management */}
          <div className="flex flex-col gap-1">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Management</h4>
            <NavItem
              icon={<Calendar size={18} />}
              label="Manage Event Details"
              isActive={activeItem === 'event-details'}
              onClick={() => handleNavigation('event-details-modal', 'event-details')}
            />
            <NavItem
              icon={<Users size={18} />}
              label="Update Contestants"
              isActive={activeItem === 'contestants'}
              onClick={() => handleNavigation('candidates', 'contestants')}
            />
            <NavItem
              icon={<FolderKanban size={18} />}
              label="Adjust Scoring Criteria"
              isActive={activeItem === 'criteria'}
              onClick={() => handleNavigation('categories', 'criteria')}
            />
            <NavItem
              icon={<Layers size={18} />}
              label="Manage Rounds"
              isActive={activeItem === 'rounds'}
              onClick={() => handleNavigation('rounds', 'rounds')}
            />
          </div>

          {/* User Management */}
          <div className="flex flex-col gap-1">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Management</h4>
            <NavItem
              icon={<UserCircle size={18} />}
              label="Configure Judges"
              isActive={activeItem === 'judges-modal'}
              onClick={() => handleNavigation('judges-modal', 'judges-modal')}
            />
            <NavItem
              icon={<Shield size={18} />}
              label="Manage Admin Users"
              isActive={activeItem === 'admin-users'}
              onClick={() => handleNavigation(null, 'admin-users')}
            />
          </div>

          {/* Reports */}
          <div className="flex flex-col gap-1">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reports</h4>
            <NavItem
              icon={<BarChart3 size={18} />}
              label="Live Results"
              isActive={activeItem === 'results'}
              onClick={() => handleNavigation('results', 'results')}
            />
            <NavItem
              icon={<Download size={18} />}
              label="Export All Scores"
              isActive={activeItem === 'export'}
              onClick={() => handleNavigation(null, 'export')}
            />
            <NavItem
              icon={<Award size={18} />}
              label="Review Certificates"
              isActive={activeItem === 'certificates'}
              onClick={() => handleNavigation('/admin/certificates', 'certificates')}
            />
          </div>

          {/* System Settings */}
          <div className="flex flex-col gap-1">
            <h4 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">System Settings</h4>
            <NavItem
              icon={<Settings size={18} />}
              label="General Settings"
              isActive={activeItem === 'settings'}
              onClick={() => handleNavigation('settings-modal', 'settings')}
            />
            <NavItem
              icon={<Palette size={18} />}
              label="Theme Preferences"
              isActive={activeItem === 'theme'}
              onClick={() => handleNavigation('theme-modal', 'theme')}
            />
          </div>
        </nav>
      </aside>
    </>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${isActive
        ? 'text-indigo-600 bg-white/60 shadow-sm font-semibold'
        : isHovered
          ? 'text-gray-800 bg-black/5'
          : 'text-gray-600 hover:bg-black/5 hover:text-gray-800'
        }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
