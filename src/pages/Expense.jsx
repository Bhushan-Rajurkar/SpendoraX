import { useState, useEffect, useContext } from "react";
import Dashboard from "../components/Dashboard";
import { useUser } from "../hooks/useUser";
import { AppContext } from "../context/AppContext";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import ExpenseList from "../components/ExpenseList";
import ExpenseOverview from "../components/ExpenseOverview";
import AddExpenseForm from "../components/AddExpenseForm";
import Model from "../components/Model";
import DeleteAlert from "../components/DeleteAlert";
import EmailReportModal from "../components/EmailReportModal";
import toast from "react-hot-toast";
import { exportTransactionsToCsv } from "../util/helper";

const Expense = () => {
  useUser();
  const { user } = useContext(AppContext);

  const [expenseData, setExpenseData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAddExpenseModel, setOpenAddExpenseModel] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  // Fetch Expenses
  const fetchExpenseDetails = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_EXPENSES);
      if (response.status === 200) {
        setExpenseData(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch expense details", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch expense details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Expense Categories
  const fetchExpenseCategories = async () => {
    try {
      const response = await axiosConfig.get(
        API_ENDPOINTS.CATEGORY_BY_TYPE("expense")
      );
      if (response.status === 200) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch expense categories", error);
    }
  };

  // Download Expenses Excel
  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosConfig.get(
        API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Expense details downloaded successfully.");
    } catch (error) {
      console.warn("Backend Excel download failed, falling back to CSV", error);
      exportTransactionsToCsv(expenseData, "expense_details.csv");
      toast.success("Expense details exported to CSV successfully.");
    }
  };

  // Server email trigger
  const handleServerEmail = async (toEmail) => {
    return await axiosConfig.get(API_ENDPOINTS.EMAIL_EXPENSE_DETAILS, {
      params: toEmail ? { to: toEmail } : {},
    });
  };

  // Add Expense
  const handleAddExpense = async (expense) => {
    const { name, amount, date, icon, categoryId } = expense;

    if (!name?.trim()) {
      toast.error("Please enter an expense name");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
        name,
        amount: Number(amount),
        date,
        icon,
        categoryId,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Expense added successfully");
        setOpenAddExpenseModel(false);
        fetchExpenseDetails();
        fetchExpenseCategories();
      }
    } catch (error) {
      console.error("Error adding expense", error);
      toast.error(
        error.response?.data?.message || "Failed to add expense"
      );
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense deleted successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error deleting expense", error);
      toast.error(
        error.response?.data?.message || "Failed to delete expense"
      );
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
    fetchExpenseCategories();
  }, []);

  return (
    <Dashboard activeMenu="Expense">
      <div className="my-5 mx-auto space-y-6">
        <ExpenseOverview
          transactions={expenseData}
          categories={categories}
          onAddExpense={() => setOpenAddExpenseModel(true)}
        />

        <ExpenseList
          transactions={expenseData}
          onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
          onDownload={handleDownloadExpenseDetails}
          onEmail={() => setOpenEmailModal(true)}
        />

        {/* Email Report Modal */}
        <EmailReportModal
          isOpen={openEmailModal}
          onClose={() => setOpenEmailModal(false)}
          type="expense"
          transactions={expenseData}
          user={user}
          onServerEmail={handleServerEmail}
        />

        {/* Add Expense Modal */}
        <Model
          isOpen={openAddExpenseModel}
          onClose={() => setOpenAddExpenseModel(false)}
          title="Add Expense"
        >
          <AddExpenseForm
            categories={categories}
            onAddExpense={handleAddExpense}
          />
        </Model>

        {/* Delete Expense Modal */}
        <Model
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense?"
            onDelete={() => deleteExpense(openDeleteAlert.data)}
          />
        </Model>
      </div>
    </Dashboard>
  );
};

export default Expense;
