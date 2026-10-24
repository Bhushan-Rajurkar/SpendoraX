import { useState, useEffect, useContext } from "react";
import Dashboard from "../components/Dashboard";
import { useUser } from "../hooks/useUser";
import { AppContext } from "../context/AppContext";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Filter as FilterIcon,
  PieChart as PieIcon,
  Activity,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatCurrency, prepareCategoryPieData } from "../util/helper";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Model from "../components/Model";
import AddIncomeForm from "../components/AddIncomeForm";
import AddExpenseForm from "../components/AddExpenseForm";
import TransactionIcon from "../components/TransactionIcon";
import toast from "react-hot-toast";

const Home = () => {
  useUser();
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    recentTransactions: [],
    recent5Expenses: [],
    recent5Incomes: [],
  });

  const [allExpenses, setAllExpenses] = useState([]);
  const [allIncomes, setAllIncomes] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modals for quick actions
  const [openIncomeModal, setOpenIncomeModal] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, expRes, incRes, catRes] = await Promise.allSettled([
        axiosConfig.get(API_ENDPOINTS.DASHBOARD_DATA),
        axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSES),
        axiosConfig.get(API_ENDPOINTS.GET_ALL_INCOMES),
        axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value.status === 200) {
        const data = dashRes.value.data;
        const bal = data.totalBalance !== undefined ? data.totalBalance : data.totalBalence;
        setDashboardData({
          totalBalance: Number(bal || 0),
          totalIncome: Number(data.totalIncome || 0),
          totalExpense: Number(data.totalExpense || 0),
          recentTransactions: data.recentTransactions || [],
          recent5Expenses: data.recent5Expenses || [],
          recent5Incomes: data.recent5Incomes || [],
        });
      }

      if (expRes.status === "fulfilled" && expRes.value.status === 200) {
        setAllExpenses(expRes.value.data || []);
      }

      if (incRes.status === "fulfilled" && incRes.value.status === 200) {
        setAllIncomes(incRes.value.data || []);
      }

      if (catRes.status === "fulfilled" && catRes.value.status === 200) {
        setCategories(catRes.value.data || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Quick Add Income
  const handleAddIncome = async (income) => {
    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, {
        ...income,
        amount: Number(income.amount),
      });
      if (response.status === 201 || response.status === 200) {
        toast.success("Income added successfully");
        setOpenIncomeModal(false);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add income");
    }
  };

  // Handle Quick Add Expense
  const handleAddExpense = async (expense) => {
    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
        ...expense,
        amount: Number(expense.amount),
      });
      if (response.status === 201 || response.status === 200) {
        toast.success("Expense added successfully");
        setOpenExpenseModal(false);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    }
  };

  const totalInc = dashboardData.totalIncome;
  const totalExp = dashboardData.totalExpense;
  const totalBal = dashboardData.totalBalance;
  const savingsRate =
    totalInc > 0 ? Math.max(0, Math.round(((totalInc - totalExp) / totalInc) * 100)) : 0;

  // Comparison Bar Chart Data
  const comparisonData = [
    { name: "Total Income", amount: totalInc, fill: "#10B981" },
    { name: "Total Expense", amount: totalExp, fill: "#F43F5E" },
    { name: "Net Balance", amount: Math.max(0, totalBal), fill: "#8B5CF6" },
  ];

  // Category Breakdown Pie Data
  const expensePieData = prepareCategoryPieData(allExpenses, categories);
  const incomePieData = prepareCategoryPieData(allIncomes, categories);

  return (
    <Dashboard activeMenu="Dashboard">
      <div className="my-5 mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-purple-200 mb-3">
              <Activity size={14} /> Overview & Analytics
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
              Welcome back, {user?.fullName || "Friend"}! 👋
            </h1>
            <p className="text-purple-200/80 text-xs sm:text-sm max-w-xl">
              Here is your financial pulse for this month. Stay on top of your income, expenses, and savings goals.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setOpenIncomeModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={16} /> Add Income
            </button>
            <button
              onClick={() => setOpenExpenseModal(true)}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={16} /> Add Expense
            </button>
            <button
              onClick={() => navigate("/filter")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition-all border border-white/10 active:scale-95"
            >
              <FilterIcon size={16} /> Filters
            </button>
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        </div>

        {/* 3 Metric Cards + Savings Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Balance Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Balance
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Wallet size={20} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-2xl font-bold ${totalBal >= 0 ? "text-gray-900" : "text-rose-600"}`}>
                {formatCurrency(totalBal)}
              </h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                Net remaining funds
              </p>
            </div>
          </div>

          {/* Total Income Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Income
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalInc)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {allIncomes.length} records recorded
              </p>
            </div>
          </div>

          {/* Total Expense Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Expense
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <TrendingDown size={20} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-rose-600">
                {formatCurrency(totalExp)}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {allExpenses.length} spendings recorded
              </p>
            </div>
          </div>

          {/* Savings Rate Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Savings Rate
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <PieIcon size={20} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-indigo-600">
                {savingsRate}%
              </h3>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparison Bar Chart (2 cols on large screen) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                  Cash Flow Comparison
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Income vs Expense vs Net Balance
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                This Period
              </span>
            </div>

            <div className="w-full min-w-0 h-[260px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Amount"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={48}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense by Category Donut Chart */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                  Expense by Category
                </h4>
                <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  Breakdown
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Where your money goes
              </p>
            </div>

            <div className="w-full min-w-0 h-[230px]">
              {expensePieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                  No expense category data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatCurrency(val), "Spent"]}
                      contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: "11px", overflowY: "auto", maxHeight: "40px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                Recent Transactions
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Latest incomes and expenses
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/income")}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                Incomes <ArrowRight size={13} />
              </button>
              <button
                onClick={() => navigate("/expense")}
                className="text-xs font-medium text-rose-700 hover:text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                Expenses <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {dashboardData.recentTransactions?.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No recent transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 mt-2">
              {dashboardData.recentTransactions?.map((tx, idx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={`${tx.type || 'tx'}-${tx.id || idx}`}
                    className="flex items-center justify-between py-3.5 hover:bg-gray-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        <TransactionIcon icon={tx.icon} type={tx.type} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[160px] sm:max-w-xs">
                          {tx.name}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          {tx.date ? moment(tx.date).format("Do MMM YYYY") : "Recent"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          isIncome ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full uppercase ${
                          isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Add Income Modal */}
        <Model
          isOpen={openIncomeModal}
          onClose={() => setOpenIncomeModal(false)}
          title="Quick Add Income"
        >
          <AddIncomeForm
            categories={categories.filter((c) => c.type === "income")}
            onAddIncome={handleAddIncome}
          />
        </Model>

        {/* Quick Add Expense Modal */}
        <Model
          isOpen={openExpenseModal}
          onClose={() => setOpenExpenseModal(false)}
          title="Quick Add Expense"
        >
          <AddExpenseForm
            categories={categories.filter((c) => c.type === "expense")}
            onAddExpense={handleAddExpense}
          />
        </Model>
      </div>
    </Dashboard>
  );
};

export default Home;