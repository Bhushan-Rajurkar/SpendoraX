import { useEffect, useState } from "react";
import CustomLineChart from "./CustomLineChart";
import { prepareExpenseLineChartData } from "../util/helper";
import { Plus } from "lucide-react";

const ExpenseOverview = ({
  transactions = [],
  categories = [],
  onAddExpense,
}) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = prepareExpenseLineChartData(transactions, categories);
    setChartData(result);
  }, [transactions, categories]);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h5 className="text-lg font-semibold text-gray-900">
            Expense Overview
          </h5>
          <p className="text-xs text-gray-500 mt-0.5">
            Track your spending patterns and analyze expense trends over time.
          </p>
        </div>

        <button
          onClick={onAddExpense}
          className="add-btn bg-rose-50 text-rose-800 hover:bg-rose-100 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      <div className="mt-6">
        <CustomLineChart data={chartData} type="expense" color="#F43F5E" />
      </div>
    </div>
  );
};

export default ExpenseOverview;
