import { useEffect, useState } from "react";
import CategoryList from "../components/CategoryList";
import Dashboard from "../components/Dashboard";
import { useUser } from "../hooks/useUser";
import { Plus } from "lucide-react";
import axiosConfig from "../util/axiosConfig";
import { API_ENDPOINTS } from "../util/apiEndpoints";
import toast from "react-hot-toast";
import Model from "../components/Model";
import AddCategoryForm from "../components/AddCategoryForm";

const Category = () => {
  useUser();
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [openAddCategoryModel, setOpenAddCategoryModel] = useState(false);
  const [openEditCategoryModel, setOpenEditCategoryModel] = useState(false);
  const [selectedCategory, setselectedCategory] = useState(null);

  const fetchCategoryDetails = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosConfig.get(API_ENDPOINTS.GET_ALL_CATEGORIES);
      if (response.status === 200) {
        setCategoryData(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast.error(error.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetails();
  }, []);

  const handleAddCategory = async (category) => {
    const { name, type, icon } = category;
    if (!name?.trim()) {
      toast.error("Category name is required");
      return;
    }

    const isDuplicate = categoryData.some(
      (cat) =>
        cat.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        cat.type === type
    );

    if (isDuplicate) {
      toast.error("Category with this name and type already exists");
      return;
    }

    try {
      const response = await axiosConfig.post(API_ENDPOINTS.ADD_CATEGORY, {
        name,
        type,
        icon,
      });
      if (response.status === 201 || response.status === 200) {
        toast.success("Category added successfully");
        setOpenAddCategoryModel(false);
        fetchCategoryDetails();
      }
    } catch (error) {
      console.error("Error adding category", error);
      toast.error(error.response?.data?.message || "Failed to add category.");
    }
  };

  const handleEditCategory = (categoryToEdit) => {
    setselectedCategory(categoryToEdit);
    setOpenEditCategoryModel(true);
  };

  const handleUpdateCategory = async (updatedCategory) => {
    const { id, name, type, icon } = updatedCategory;
    if (!name?.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (!id) {
      toast.error("Category ID is missing for update");
      return;
    }

    try {
      await axiosConfig.put(API_ENDPOINTS.UPDATE_CATEGORY(id), {
        name,
        type,
        icon,
      });
      setOpenEditCategoryModel(false);
      setselectedCategory(null);
      toast.success("Category updated successfully");
      fetchCategoryDetails();
    } catch (error) {
      console.error("Error updating category", error);
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  return (
    <Dashboard activeMenu="Category">
      <div className="my-5 mx-auto space-y-5">
        {/* Header & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Categories</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Organize your income and expense categories with custom icons
            </p>
          </div>

          <button
            onClick={() => setOpenAddCategoryModel(true)}
            className="add-btn bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm self-start sm:self-auto active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Category List */}
        <CategoryList
          categories={categoryData}
          onEditCategory={handleEditCategory}
        />

        {/* Add Category Modal */}
        <Model
          isOpen={openAddCategoryModel}
          onClose={() => setOpenAddCategoryModel(false)}
          title="Add Category"
        >
          <AddCategoryForm onAddCategory={handleAddCategory} />
        </Model>

        {/* Edit Category Modal */}
        <Model
          isOpen={openEditCategoryModel}
          onClose={() => {
            setOpenEditCategoryModel(false);
            setselectedCategory(null);
          }}
          title="Edit Category"
        >
          <AddCategoryForm
            initialCategoryData={selectedCategory}
            onAddCategory={handleUpdateCategory}
            isEditing={true}
          />
        </Model>
      </div>
    </Dashboard>
  );
};

export default Category;
