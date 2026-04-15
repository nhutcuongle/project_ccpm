import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import {
  LayoutDashboard,
  MessageCircle,
  PenSquare,
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Search,
  FileText,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import * as userService from "../../services/userService";
import { toast } from "react-hot-toast";

export default function Header() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await userService.searchUsers(searchQuery);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Tổng quan" },
    { to: "/posts", icon: <PenSquare size={20} />, label: "Bài viết" },
    { to: "/messages", icon: <MessageCircle size={20} />, label: "Nhắn tin" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 z-50 glass border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <span className="text-white font-black text-sm">B</span>
            </div>
            <span className="text-lg font-extrabold gradient-text hidden sm:block">
              BITISMS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/30 p-1 rounded-xl border border-slate-700/30">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.to)
                    ? "gradient-primary text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname.startsWith("/admin")
                    ? "gradient-primary text-white shadow-md shadow-indigo-500/25"
                    : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                <Shield size={20} />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div ref={searchRef} className="hidden md:block relative group z-50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  className="w-48 pl-9 pr-4 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all focus:w-64"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && (
                <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  {isSearching ? (
                    <div className="p-3 text-sm text-slate-400 text-center">Đang tìm...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result._id}
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery("");
                            navigate(result._id === (user?._id || user?.id) ? "/profile" : `/profile/${result._id}`);
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-slate-700/50 cursor-pointer transition-colors"
                        >
                          <Avatar src={result.avatar} name={result.username} size="sm" />
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-200 truncate">{result.username}</p>
                            <p className="text-xs text-slate-400 truncate">@{result.identifier}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-slate-400 text-center">Không có kết quả</div>
                  )}
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-all"
              >
                <Avatar src={user?.avatar} name={user?.username} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{user?.username}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">@{user?.identifier}</p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl p-2 animate-fade-in-up shadow-2xl">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-all"
                  >
                    <User size={16} />
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-all"
                  >
                    <Settings size={16} />
                    Cài đặt
                  </Link>
                  <hr className="my-1.5 border-slate-700/50" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 glass border-b border-slate-700/30 p-4 animate-fade-in-up">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.to)
                      ? "gradient-primary text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive("/admin")
                        ? "gradient-primary text-white"
                        : "text-amber-400/80 hover:bg-amber-500/10"
                    }`}
                  >
                    <Shield size={20} />
                    Bảng điều khiển Admin
                  </Link>
                  <Link
                    to="/admin/questions"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive("/admin/questions")
                        ? "gradient-primary text-white"
                        : "text-amber-400/80 hover:bg-amber-500/10"
                    }`}
                  >
                    <FileText size={20} />
                    Quản lý câu hỏi
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive("/admin/users")
                        ? "gradient-primary text-white"
                        : "text-amber-400/80 hover:bg-amber-500/10"
                    }`}
                  >
                    <Users size={20} />
                    Quản lý người dùng
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
