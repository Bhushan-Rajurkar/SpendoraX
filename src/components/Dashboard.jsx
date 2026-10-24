import Sidebar from "./Sidebar.jsx";
import { AppContext } from "../context/AppContext.jsx";
import Menubar from "./Menubar.jsx";
import ChatbotWidget from "./ChatbotWidget.jsx";
import { useContext } from "react";

const Dashboard = ({ children, activeMenu }) => {
  const { user } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Menubar activeMenu={activeMenu} />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (hidden on tablet & mobile, lg breakpoint) */}
        {user && (
          <aside className="hidden lg:block shrink-0 sticky top-[61px] h-[calc(100vh-61px)]">
            <Sidebar activeMenu={activeMenu} />
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Floating Financial AI Chatbot for all authenticated pages */}
      {user && <ChatbotWidget />}
    </div>
  );
};

export default Dashboard;