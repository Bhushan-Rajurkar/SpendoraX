import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label, type = "income" }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const isIncome = type === "income";
  const amountValue = isIncome
    ? data.totalIncome || data.amount || 0
    : data.totalExpense || data.amount || 0;

  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 min-w-[200px] text-xs sm:text-sm">
      <p className="font-semibold text-gray-800 border-b border-gray-100 pb-1.5 mb-2">
        {label}
      </p>

      <p className="mb-2">
        <span className="text-gray-500">Total {isIncome ? "Income" : "Expense"}: </span>
        <span className={`font-bold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
          ₹{Number(amountValue).toLocaleString("en-IN")}
        </span>
      </p>

      {data.details && data.details.length > 0 && (
        <div className="border-t border-gray-100 pt-1.5 mt-1.5">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Breakdown
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {data.details.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs text-gray-600">
                <span className="truncate max-w-[120px]">{item.category || item.name}</span>
                <span className="font-medium text-gray-800 ml-2">
                  ₹{Number(item.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomLineChart = ({ data = [], type = "income", color }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[240px] sm:h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <p className="text-sm">No transaction trend data available</p>
        <p className="text-xs text-gray-400 mt-1">Add transactions to visualize your spending and income trends</p>
      </div>
    );
  }

  const isIncome = type === "income";
  const strokeColor = color || (isIncome ? "#10B981" : "#F43F5E");
  const gradientId = isIncome ? "incomeChartGradient" : "expenseChartGradient";
  const dataKey = isIncome ? "totalIncome" : "totalExpense";

  return (
    <div className="w-full min-w-0 h-[260px] sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart
          data={data}
          margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748B" }}
            interval="preserveStartEnd"
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748B" }}
            tickFormatter={(val) => {
              if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
              return `₹${val}`;
            }}
          />

          <Tooltip content={<CustomTooltip type={type} />} />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 6, stroke: strokeColor, strokeWidth: 2, fill: "#FFFFFF" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
