import { Mail, Download, LoaderCircle } from "lucide-react";
import TransactionInfoCard from "./TransactionInfoCard";
import moment from "moment";
import { useState } from "react";
import { exportTransactionsToCsv } from "../util/helper";

const ExpenseList = ({ transactions = [], onDelete, onDownload, onEmail }) => {
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (onDownload) {
        await onDownload();
      } else {
        exportTransactionsToCsv(transactions, "expense_details.csv");
      }
    } catch {
      exportTransactionsToCsv(transactions, "expense_details.csv");
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async () => {
    setEmailing(true);
    try {
      if (onEmail) {
        await onEmail();
      }
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h5 className="text-lg font-semibold text-gray-900">
            Expense Records
          </h5>
          <p className="text-xs text-gray-500 mt-0.5">
            {transactions.length} recorded {transactions.length === 1 ? "expense" : "expenses"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={emailing || transactions.length === 0}
            className="card-btn hover:bg-rose-50 hover:text-rose-700 text-xs sm:text-sm"
            onClick={handleEmail}
            title="Email expense report"
          >
            {emailing ? (
              <>
                <LoaderCircle className="animate-spin w-4 h-4 text-rose-600" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail size={15} className="text-rose-600" />
                <span>Email</span>
              </>
            )}
          </button>

          <button
            disabled={downloading || transactions.length === 0}
            className="card-btn hover:bg-emerald-50 hover:text-emerald-700 text-xs sm:text-sm"
            onClick={handleDownload}
            title="Download Excel/CSV expense report"
          >
            {downloading ? (
              <>
                <LoaderCircle className="animate-spin w-4 h-4 text-emerald-600" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download size={15} className="text-emerald-600" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-sm">No expenses recorded for this period.</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Expense" to start tracking your spendings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {transactions.map((expense, idx) => (
            <TransactionInfoCard
              key={`expense-${expense.id || idx}`}
              title={expense.name}
              icon={expense.icon}
              date={moment(expense.date).format("Do MMM YYYY")}
              amount={expense.amount}
              type="expense"
              onDelete={() => onDelete(expense.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
