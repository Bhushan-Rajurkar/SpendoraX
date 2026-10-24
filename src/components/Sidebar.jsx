import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { User } from "lucide-react";
import { SIDE_BAR_DATA } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ activeMenu, onClose }) => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200/70 p-5 h-full flex flex-col justify-between">
      <div>
        {/* User Profile Mini Card */}
        <div className="flex flex-col items-center justify-center gap-2 mt-2 mb-6 p-4 rounded-xl bg-purple-50/60 border border-purple-100/50">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-16 h-16 object-cover rounded-full border-2 border-purple-600 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center font-bold text-xl shadow-sm">
              {user?.fullName?.charAt(0)?.toUpperCase() || <User className="w-8 h-8" />}
            </div>
          )}
          <div className="text-center">
            <h5 className="text-gray-900 font-semibold text-sm truncate max-w-[190px]">
              {user?.fullName || "Welcome"}
            </h5>
            <p className="text-xs text-gray-500 truncate max-w-[190px]">
              {user?.email || ""}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {SIDE_BAR_DATA.map((item, index) => {
            const isActive = activeMenu === item.label;
            return (
              <button
                key={`menu_${index}`}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3.5 text-sm font-medium py-3 px-4 rounded-xl transition-all duration-150 ${
                  isActive
                    ? "text-white bg-purple-800 shadow-sm shadow-purple-900/20"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-white" : "text-gray-500"}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 text-center border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          SpendoraX © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;