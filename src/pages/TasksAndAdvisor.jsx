import { useState, useEffect, useContext } from "react";
import Dashboard from "../components/Dashboard";
import { useUser } from "../hooks/useUser";
import { AppContext } from "../context/AppContext";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Coffee,
  Bus,
  ShoppingBag,
  Zap,
  TrendingDown,
  Info,
  Calendar,
  RefreshCw,
  Send,
  Bot,
} from "lucide-react";
import {
  getUserWeekStatus,
  getOrInitWeeklyTasks,
  saveWeeklyTasks,
  calculateLevelFromXp,
  TASK_CATEGORIES,
  getCurrentWeekId,
  generateWeeklyTasks,
  generateFinancialChatResponse,
} from "../util/taskAdvisorEngine";
import toast from "react-hot-toast";

const TasksAndAdvisor = () => {
  useUser();
  const { user } = useContext(AppContext);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [weekOverride, setWeekOverride] = useState(null); // null = auto, 1 = Week 1, 2 = Week 2+
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  // Embedded chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: "👋 Welcome to your **Gamified AI Coach**! Complete your **20 weekly tasks** to cut unnecessary habits (like excess coffee or private cabs) and earn badges!",
    },
  ]);

  const currentWeekId = getCurrentWeekId();
  const weekStatus = getUserWeekStatus(user?.createdAt, weekOverride);

  // Fetch expenses to fuel the analysis
  const fetchExpensesAndTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSES);
      const expenseList = res.data || [];
      setExpenses(expenseList);

      const loadedTasks = getOrInitWeeklyTasks(expenseList, currentWeekId);
      setTasks(loadedTasks);
    } catch (e) {
      console.warn("Could not fetch expenses for task engine", e);
      const loadedTasks = getOrInitWeeklyTasks([], currentWeekId);
      setTasks(loadedTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndTasks();
  }, []);

  // Handle task completion toggle
  const handleToggleTask = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          toast.success(`🎉 Completed: "${t.title}" (+${t.xp} XP)`, {
            icon: "🏆",
          });
        }
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : null,
        };
      }
      return t;
    });

    setTasks(updated);
    saveWeeklyTasks(updated, currentWeekId);
  };

  // Force re-generate / refresh tasks for this week
  const handleRefreshTasks = () => {
    const fresh = generateWeeklyTasks(expenses, currentWeekId);
    setTasks(fresh);
    saveWeeklyTasks(fresh, currentWeekId);
    toast.success("Regenerated 20 fresh tasks tailored to your latest spending!");
  };

  // Calculate metrics
  const completedCount = tasks.filter((t) => t.completed).length;
  const earnedXp = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + (t.xp || 50), 0);
  const totalXpPossible = tasks.reduce((sum, t) => sum + (t.xp || 50), 0);
  const userRank = calculateLevelFromXp(earnedXp);

  // Filter tasks by category
  const filteredTasks =
    activeCategory === "all"
      ? tasks
      : tasks.filter((t) => t.category === activeCategory);

  // Embedded chat submit
  const handleSendChat = (text) => {
    const query = text || chatInput;
    if (!query.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: query },
    ]);
    if (!text) setChatInput("");

    setTimeout(() => {
      const reply = generateFinancialChatResponse(query, {
        expenses,
        tasks,
      });
      setChatMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "bot", text: reply },
      ]);
    }, 500);
  };

  return (
    <Dashboard activeMenu="AI Coach & Tasks">
      <div className="my-5 mx-auto space-y-6">
        {/* Hero Banner: Level, XP & Weekly Status */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-amber-300">
                  <Trophy size={14} /> Level {userRank.level} • {userRank.title}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200">
                  <Calendar size={13} /> {currentWeekId}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Gamified Financial Tasks & AI Coach
              </h1>
              <p className="text-purple-200/80 text-xs sm:text-sm max-w-xl">
                Tackle 20 personalized, healthy money-saving micro-habits every week based on your daily spending habits!
              </p>
            </div>

            {/* Gamified Level & XP Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 w-full md:w-72 shrink-0">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-purple-200">Level Progress</span>
                <span className="text-amber-300">{earnedXp} / {totalXpPossible} XP</span>
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      totalXpPossible > 0 ? (earnedXp / totalXpPossible) * 100 : 0
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-purple-200/80">
                <span>{completedCount} of 20 tasks done</span>
                <span className="font-bold text-white">
                  {Math.round((completedCount / 20) * 100)}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Banner (Week 1 Observation vs Week 2 Active Tasks) */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-purple-200">Simulation / Testing Mode:</span>
              <button
                onClick={() => setWeekOverride(1)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  weekStatus.isWeek1
                    ? "bg-amber-400 text-gray-950 font-bold"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                Week 1 (Observation Phase)
              </button>
              <button
                onClick={() => setWeekOverride(2)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  !weekStatus.isWeek1
                    ? "bg-emerald-400 text-gray-950 font-bold"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                Week 2+ (20 Active Tasks)
              </button>
            </div>

            {!weekStatus.isWeek1 && (
              <button
                onClick={handleRefreshTasks}
                className="flex items-center gap-1.5 text-purple-200 hover:text-white font-medium"
                title="Regenerate tasks based on latest expenses"
              >
                <RefreshCw size={13} /> Reset Weekly Tasks
              </button>
            )}
          </div>

          {/* Decorative Circles */}
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        </div>

        {/* CONDITION 1: Week 1 Observation Phase */}
        {weekStatus.isWeek1 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm text-center max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center text-4xl shadow-inner">
              🔍
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-semibold text-xs rounded-full uppercase tracking-wider">
                Week 1: Financial Observation Phase
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                We're Learning Your Spending Habits!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                During your first 7 days, there are <strong>no tasks</strong> assigned. Our AI is analyzing your daily routines — from your coffee runs and commute patterns to dining and shopping habits.
              </p>
            </div>

            {/* Observation tracker */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span>Phase Progress</span>
                <span>Day {weekStatus.daysActive} of 7</span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (weekStatus.daysActive / 7) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400">
                ⏳ <strong>{weekStatus.daysRemainingInWeek} days remaining</strong> until your first set of 20 personalized gamified challenges unlock!
              </p>
            </div>

            {/* Quick Fast-Forward CTA */}
            <div className="pt-2">
              <button
                onClick={() => setWeekOverride(2)}
                className="add-btn add-btn-fill px-6 py-3 rounded-xl font-semibold text-sm shadow-md"
              >
                ⚡ Fast-Forward to Week 2 Tasks (Preview & Start Now)
              </button>
            </div>
          </div>
        ) : (
          /* CONDITION 2: Week 2+ Active 20 Gamified Tasks View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Task Cards & Categories */}
            <div className="lg:col-span-8 space-y-5">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-3.5 py-2 rounded-xl font-medium shrink-0 transition-all ${
                    activeCategory === "all"
                      ? "bg-purple-800 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  All Tasks (20)
                </button>
                {Object.values(TASK_CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl font-medium shrink-0 transition-all ${
                      activeCategory === cat
                        ? "bg-purple-800 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tasks List (20 items) */}
              <div className="space-y-3">
                {filteredTasks.map((task, idx) => {
                  const isDone = task.completed;
                  return (
                    <div
                      key={task.id || idx}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex items-start gap-4 ${
                        isDone
                          ? "border-emerald-200 bg-emerald-50/20"
                          : "border-gray-200/70 hover:border-purple-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-1 shrink-0 transition-transform active:scale-90 ${
                          isDone ? "text-emerald-600" : "text-gray-300 hover:text-purple-600"
                        }`}
                        title={isDone ? "Mark as incomplete" : "Mark as completed"}
                      >
                        {isDone ? (
                          <CheckCircle2 size={24} className="fill-emerald-100" />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4
                            className={`text-sm sm:text-base font-semibold ${
                              isDone ? "line-through text-gray-400" : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            {task.category}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-4 mt-2.5 text-[11px] font-medium">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            💰 Est. Save: <strong>{task.savings}</strong>
                          </span>
                          <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            ⚡ <strong>+{task.xp} XP</strong>
                          </span>
                          <span className="text-gray-400 hidden sm:inline">
                            Difficulty: {task.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4 Cols: Embedded Financial AI Coach Chat */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col h-[650px]">
                <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      AI Financial Advisor
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Ask about coffee, commute, or tasks
                    </p>
                  </div>
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
                  {chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl p-3 leading-relaxed whitespace-pre-wrap ${
                          m.sender === "user"
                            ? "bg-purple-700 text-white rounded-br-none"
                            : "bg-slate-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick suggestions */}
                <div className="py-2 flex flex-wrap gap-1.5 shrink-0 border-t border-gray-100">
                  <button
                    onClick={() => handleSendChat("Analyze my coffee habits")}
                    className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-2 py-1 rounded-md"
                  >
                    ☕ Coffee habits
                  </button>
                  <button
                    onClick={() => handleSendChat("Tips to save on commute & cabs")}
                    className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-2 py-1 rounded-md"
                  >
                    🚌 Commute tips
                  </button>
                  <button
                    onClick={() => handleSendChat("How am I doing with my budget?")}
                    className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-2 py-1 rounded-md"
                  >
                    📊 Budget review
                  </button>
                </div>

                {/* Input bar */}
                <div className="pt-2 flex items-center gap-1.5 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendChat();
                    }}
                    placeholder="Ask your AI coach..."
                    className="flex-1 bg-gray-100 border border-transparent focus:border-purple-600 focus:bg-white rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendChat()}
                    className="p-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl active:scale-95 transition-all"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default TasksAndAdvisor;
