import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Trash2,
    Users,
    DollarSign,
    Settings,
    LogOut,
    ShieldCheck,
    Menu,
    X
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin-dashboard' },
        { icon: <Trash2 size={20} />, label: 'Requests', path: '/admin-dashboard/requests' },
        { icon: <Users size={20} />, label: 'Workers', path: '/admin-dashboard/workers' },
        { icon: <DollarSign size={20} />, label: 'Pricing', path: '/admin-dashboard/pricing' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/admin-dashboard/settings' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-inter">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Section */}
                    <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">QuickClean</h2>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">Admin Portal</span>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 p-4 mt-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/admin-dashboard'}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
                  ${isActive
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer User Profile */}
                    <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3 p-3 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                                {user?.user_metadata?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.user_metadata?.name || 'Administrator'}</p>
                                <p className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">System Superuser</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-all"
                        >
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
                {/* Mobile Header Toggle */}
                <header className="lg:hidden p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600" />
                        <h1 className="font-bold text-slate-900">Admin</h1>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-slate-100 rounded-lg text-slate-600"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </header>

                {/* Content Render Area */}
                <div className="h-full overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
