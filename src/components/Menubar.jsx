import { useRef, useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X, User, Eye, EyeOff } from "lucide-react";
import { assets } from "../assets/assets";
import Sidebar from "./Sidebar";

const Menubar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const dropdownRef = useRef(null);
  const { user, clearUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    setShowDropdown(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Lock background scroll when mobile sidebar is open
  useEffect(() => {
    if (openSideMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openSideMenu]);

  const truncatedEmail =
    user?.email?.length > 22
      ? user.email.slice(0, 22) + "..."
      : user?.email;

  return (
    <>
      <header className="flex items-center justify-between gap-4 bg-white/95 border-b border-gray-200/70 backdrop-blur-md py-3.5 px-4 sm:px-7 sticky top-0 z-30 shadow-xs">
        {/* Left side: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setOpenSideMenu(!openSideMenu)}
            className="block lg:hidden text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {openSideMenu ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            {assets.logo ? (
              <img
                src={assets.logo}
                alt="SpendoraX"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            ) : null}
            <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Spendora<span className="text-purple-700">X</span>
            </span>
          </div>
        </div>

        {/* Right side: User Profile & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          >
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-purple-200"
              />
            ) : (
              <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || <User size={18} />}
              </div>
            )}
          </button>

          {/* User Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.fullName || "User"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-gray-500 truncate">
                    {showEmail ? user?.email : truncatedEmail}
                  </p>
                  {user?.email?.length > 20 && (
                    <button
                      onClick={() => setShowEmail(!showEmail)}
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                      title={showEmail ? "Mask email" : "Show full email"}
                    >
                      {showEmail ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick links inside dropdown */}
              <div className="py-1 px-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/category");
                  }}
                  className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Manage Categories
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/filter");
                  }}
                  className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Filters & Reports
                </button>
              </div>

              {/* Logout */}
              <div className="pt-1 px-1 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {openSideMenu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setOpenSideMenu(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-base font-bold text-gray-900">Navigation</span>
              <button
                onClick={() => setOpenSideMenu(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeMenu={activeMenu}
                onClose={() => setOpenSideMenu(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Menubar;