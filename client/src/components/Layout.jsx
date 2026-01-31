import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, UserPlus, Users, Settings, PlusCircle } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Doctor View', icon: <Activity size={20} /> },
        { path: '/reception', label: 'Reception Desk', icon: <Users size={20} /> },
        { path: '/intake', label: 'Patient Intake', icon: <UserPlus size={20} /> },
        { path: '/admin', label: 'Admin & Mutations', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                        TriageOS
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">HackNagpur 2.0</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-slate-400">System Operational</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white border-b border-slate-200/60 sticky top-0 z-10 p-4 px-8 flex justify-between items-center shadow-sm backdrop-blur-sm bg-white/80">
                    <h2 className="text-xl font-semibold text-slate-800">
                        {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-slate-500">Dr. Smith (On Duty)</span>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                            DS
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
