import { useEffect, useState } from "react";
import Input from "./input";
import EmojiPickerPopup from "./EmojiPickerPopup";
import { LoaderCircle } from "lucide-react";

const AddExpenseForm = ({ categories = [], onAddExpense }) => {
  const [expense, setExpense] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    icon: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState(false);

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const handleChange = (key, value) => {
    setExpense((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddExpense = async () => {
    setLoading(true);
    try {
      await onAddExpense(expense);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0 && !expense.categoryId) {
      setExpense((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, expense.categoryId]);

  return (
    <div className="space-y-4">
      <EmojiPickerPopup
        icon={expense.icon}
        onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
      />

      <Input
        value={expense.name}
        onChange={({ target }) => handleChange("name", target.value)}
        label="Expense Name"
        placeholder="e.g. Groceries, Rent, Utilities, Coffee"
        type="text"
      />

      <Input
        label="Category"
        value={expense.categoryId}
        onChange={({ target }) => handleChange("categoryId", target.value)}
        isSelect={true}
        options={categoryOptions}
      />

      <Input
        value={expense.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount"
        placeholder="e.g. 250.00"
        type="number"
      />

      <Input
        value={expense.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date"
        type="date"
      />

      <div className="flex justify-end pt-3">
        <button
          onClick={handleAddExpense}
          disabled={loading}
          className="add-btn add-btn-fill w-full sm:w-auto"
        >
          {loading ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <span>Add Expense</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
