import { useState, useEffect, useContext } from "react";
import Dashboard from "../components/Dashboard";
import { useUser } from "../hooks/useUser";
import { AppContext } from "../context/AppContext";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import IncomeList from "../components/IncomeList";
import Model from "../components/Model";
import AddIncomeForm from "../components/AddIncomeForm";
import toast from "react-hot-toast";
import DeleteAlert from "../components/DeleteAlert";
import IncomeOverview from "../components/IncomeOverview";
import EmailReportModal from "../components/EmailReportModal";
import { exportTransactionsToCsv } from "../util/helper";

const Income = () => {
  useUser();
  const { user } = useContext(AppContext);

  const [incomeData, setIncomeData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAddIncomeModel, setOpenAddIncomeModel] = useState(false);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });

  // Download Income Excel
  const handleDownloadIncomeDetails = async () => {
    try {
      const response = await axiosConfig.get(
        API_ENDPOINTS.INCOME_EXCEL_DOWNLOAD,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income_details.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Income details downloaded successfully.");
    } catch (error) {
      console.warn("Backend Excel download failed, falling back to CSV", error);
      exportTransactionsToCsv(incomeData, "income_details.csv");
      toast.success("Income details exported to CSV successfully.");
    }
  };

  // Server email trigger
  const handleServerEmail = async (toEmail) => {
    return await axiosConfig.get(API_ENDPOINTS.EMAIL_INCOME_DETAILS, {
      params: toEmail ? { to: toEmail } : {},
    });
  };

  // Fetch Income Details
  const fetchIncomeDetails = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_INCOMES);
      if (response.status === 200) {
        setIncomeData(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch income details", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch income details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Income Categories
  const fetchIncomeCategories = async () => {
    try {
      const response = await axiosConfig.get(
        API_ENDPOINTS.CATEGORY_BY_TYPE("income")
      );
      if (response.status === 200) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch income categories", error);
    }
  };

  // Add Income
  const handleAddIncome = async (income) => {
    const { name, amount, date, icon, categoryId } = income;

    if (!name?.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Amount is not valid");
      return;
    }

    if (!date) {
      toast.error("Please enter a date");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_INCOME, {
        name,
        amount: Number(amount),
        date,
        icon,
        categoryId,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Income added successfully");
        setOpenAddIncomeModel(false);
        fetchIncomeDetails();
        fetchIncomeCategories();
      }
    } catch (error) {
      console.error("Error adding income", error);
      toast.error(
        error.response?.data?.message || "Failed to add income"
      );
    }
  };

  // Delete Income
  const deleteIncome = async (id) => {
    try {
      await axiosConfig.delete(API_ENDPOINTS.DELETE_INCOME(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Income deleted successfully");
      fetchIncomeDetails();
    } catch (error) {
      console.error("Error deleting income", error);
      toast.error(
        error.response?.data?.message || "Failed to delete income"
      );
    }
  };

  useEffect(() => {
    fetchIncomeDetails();
    fetchIncomeCategories();
  }, []);

  return (
    <Dashboard activeMenu="Income">
      <div className="my-5 mx-auto space-y-6">
        <IncomeOverview
          transactions={incomeData}
          categories={categories}
          onAddIncome={() => setOpenAddIncomeModel(true)}
        />

        <IncomeList
          transactions={incomeData}
          onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
          onDownload={handleDownloadIncomeDetails}
          onEmail={() => setOpenEmailModal(true)}
        />

        {/* Email Report Modal */}
        <EmailReportModal
          isOpen={openEmailModal}
          onClose={() => setOpenEmailModal(false)}
          type="income"
          transactions={incomeData}
          user={user}
          onServerEmail={handleServerEmail}
        />

        {/* Add Income Modal */}
        <Model
          isOpen={openAddIncomeModel}
          onClose={() => setOpenAddIncomeModel(false)}
          title="Add Income"
        >
          <AddIncomeForm
            categories={categories}
            onAddIncome={handleAddIncome}
          />
        </Model>

        {/* Delete Income Modal */}
        <Model
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Income"
        >
          <DeleteAlert
            content="Are you sure you want to delete this income?"
            onDelete={() => deleteIncome(openDeleteAlert.data)}
          />
        </Model>
      </div>
    </Dashboard>
  );
};

export default Income;