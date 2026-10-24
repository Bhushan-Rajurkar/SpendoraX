import { useState, useEffect } from "react";
import Dashboard from "../components/Dashboard";
import { useUser } from "../hooks/useUser";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import {
  Search,
  Filter as FilterIcon,
  Download,
  Calendar,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpDown,
  LoaderCircle,
} from "lucide-react";
import { formatCurrency, exportTransactionsToCsv } from "../util/helper";
import TransactionIcon from "../components/TransactionIcon";
import moment from "moment";
import toast from "react-hot-toast";

const Filter = () => {
  useUser();

  const [type, setType] = useState("all"); // "all" | "income" | "expense"
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState(
    moment().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    moment().endOf("month").format("YYYY-MM-DD")
  );
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Quick Preset Helper
  const applyPreset = (preset) => {
    const today = moment();
    if (preset === "today") {
      setStartDate(today.format("YYYY-MM-DD"));
      setEndDate(today.format("YYYY-MM-DD"));
    } else if (preset === "thisMonth") {
      setStartDate(today.clone().startOf("month").format("YYYY-MM-DD"));
      setEndDate(today.clone().endOf("month").format("YYYY-MM-DD"));
    } else if (preset === "last30Days") {
      setStartDate(today.clone().subtract(30, "days").format("YYYY-MM-DD"));
      setEndDate(today.format("YYYY-MM-DD"));
    } else if (preset === "thisYear") {
      setStartDate(today.clone().startOf("year").format("YYYY-MM-DD"));
      setEndDate(today.clone().endOf("year").format("YYYY-MM-DD"));
    } else if (preset === "allTime") {
      setStartDate("2020-01-01");
      setEndDate(today.format("YYYY-MM-DD"));
    }
  };

  // Perform the filter request
  const handleFilter = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      if (type === "income" || type === "expense") {
        const payload = {
          type,
          startdate: startDate || null,
          endDate: endDate || null,
          keyword: keyword.trim() || null,
          sortField,
          sortOrder,
        };
        const response = await axiosConfig.post(
          API_ENDPOINTS.FILTER_TRANSACTIONS,
          payload
        );
        if (response.status === 200) {
          const list = (response.data || []).map((item) => ({
            ...item,
            type,
          }));
          setResults(list);
        }
      } else {
        // "all" - request both income and expense and merge
        const [incRes, expRes] = await Promise.allSettled([
          axiosConfig.post(API_ENDPOINTS.FILTER_TRANSACTIONS, {
            type: "income",
            startdate: startDate || null,
            endDate: endDate || null,
            keyword: keyword.trim() || null,
            sortField,
            sortOrder,
          }),
          axiosConfig.post(API_ENDPOINTS.FILTER_TRANSACTIONS, {
            type: "expense",
            startdate: startDate || null,
            endDate: endDate || null,
            keyword: keyword.trim() || null,
            sortField,
            sortOrder,
          }),
        ]);

        let combined = [];
        if (incRes.status === "fulfilled" && incRes.value.status === 200) {
          combined = combined.concat(
            (incRes.value.data || []).map((i) => ({ ...i, type: "income" }))
          );
        }
        if (expRes.status === "fulfilled" && expRes.value.status === 200) {
          combined = combined.concat(
            (expRes.value.data || []).map((e) => ({ ...e, type: "expense" }))
          );
        }

        // Client sort combined results
        combined.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];
          if (sortField === "amount") {
            valA = Number(valA || 0);
            valB = Number(valB || 0);
          } else if (sortField === "date") {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
          } else {
            valA = String(valA || "").toLowerCase();
            valB = String(valB || "").toLowerCase();
          }
          if (sortOrder === "asc") return valA > valB ? 1 : -1;
          return valA < valB ? 1 : -1;
        });

        setResults(combined);
      }
    } catch (error) {
      console.error("Filter failed", error);
      toast.error(error.response?.data?.message || "Failed to filter transactions");
    } finally {
      setLoading(false);
    }
  };

  // Reset Filters
  const handleReset = () => {
    setType("all");
    setKeyword("");
    setStartDate(moment().startOf("month").format("YYYY-MM-DD"));
    setEndDate(moment().endOf("month").format("YYYY-MM-DD"));
    setSortField("date");
    setSortOrder("desc");
    setResults([]);
    setHasSearched(false);
  };

  // Initial load
  useEffect(() => {
    handleFilter();
  }, []);

  // Compute summary metrics of filtered results
  const totalIncomeSum = results
    .filter((r) => r.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalExpenseSum = results
    .filter((r) => r.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const netBalance = totalIncomeSum - totalExpenseSum;

  const handleExportFiltered = () => {
    if (results.length === 0) {
      toast.error("No results to export");
      return;
    }
    exportTransactionsToCsv(results, `filtered_transactions_${startDate}_to_${endDate}.csv`);
    toast.success("Filtered results exported to CSV");
  };

  return (
    <Dashboard activeMenu="Filters">
      <div className="my-5 mx-auto space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Transaction Filters & Reports
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Filter by date range, transaction type, source, and keywords
            </p>
          </div>

          <button
            onClick={handleExportFiltered}
            disabled={results.length === 0}
            className="card-btn hover:bg-emerald-50 hover:text-emerald-700 text-xs sm:text-sm self-start sm:self-auto"
          >
            <Download size={15} className="text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Configuration Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-5">
          {/* Row 1: Type Selection + Keyword Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Type selector */}
            <div className="md:col-span-5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("all")}
                  className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                    type === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Types
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                    type === "income"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                    type === "expense"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-rose-600"
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="md:col-span-7">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Search Keyword
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by name, description, or notes..."
                  className="w-full bg-transparent border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Date Range & Presets */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date Range
              </label>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-gray-400 mr-1 hidden sm:inline">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset("today")}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("thisMonth")}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("last30Days")}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("thisYear")}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  This Year
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("allTime")}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent border border-gray-200 rounded-xl py-2 px-3 text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-transparent border border-gray-200 rounded-xl py-2 px-3 text-sm text-gray-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Sorting + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <ArrowUpDown size={14} /> Sort By:
              </span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium py-1.5 px-2.5 text-gray-700 focus:outline-none"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="name">Name</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium py-1.5 px-2.5 text-gray-700 focus:outline-none"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} /> Reset
              </button>

              <button
                type="button"
                onClick={handleFilter}
                disabled={loading}
                className="add-btn add-btn-fill px-5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-sm"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <FilterIcon size={14} />
                    <span>Apply Filters</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Records Matched
            </span>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {results.length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Filtered Income
            </span>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              {formatCurrency(totalIncomeSum)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Filtered Expense
            </span>
            <p className="text-xl font-bold text-rose-600 mt-1">
              {formatCurrency(totalExpenseSum)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
              Net Margin
            </span>
            <p className={`text-xl font-bold mt-1 ${netBalance >= 0 ? "text-purple-600" : "text-rose-600"}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>

        {/* Results List / Table */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h4 className="text-base font-semibold text-gray-900">
              Matching Transactions
            </h4>
            <span className="text-xs text-gray-400">
              Showing {results.length} results
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <LoaderCircle className="w-8 h-8 animate-spin text-purple-600 mb-2" />
              <p className="text-sm">Fetching filtered records...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm">No transactions match your current filters.</p>
              <p className="text-xs text-gray-400 mt-1">
                Try widening your date range or removing search terms.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 mt-2">
              {results.map((tx, idx) => {
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx.id || idx}
                    className="flex items-center justify-between py-3.5 px-2 hover:bg-gray-50/70 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        <TransactionIcon icon={tx.icon} type={tx.type} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[160px] sm:max-w-xs">
                          {tx.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {moment(tx.date).format("Do MMM YYYY")}
                          </span>
                          {tx.categoryName && (
                            <>
                              <span>•</span>
                              <span className="text-gray-500 font-medium">
                                {tx.categoryName}
                              </span>
                            </>
                          )}
                        </div>
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
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full uppercase mt-0.5 ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
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
      </div>
    </Dashboard>
  );
};

export default Filter;