export const BASE_URL = "https://money-manager-backend-9jk6.onrender.com/api/v1.0";
// export const BASE_URL = "http://localhost:8080/api/v1.0";

const CLOUDINARY_CLOUD_NAME = "drjxkgaro";

export const API_ENDPOINTS = {
  // Auth & Profile
  LOGIN: "/login",
  REGISTER: "/register",
  GET_USER_INFO: "/profile",

  // Categories
  GET_ALL_CATEGORIES: "/categories",
  ADD_CATEGORY: "/categories",
  UPDATE_CATEGORY: (categoryId) => `/categories/${categoryId}`,
  CATEGORY_BY_TYPE: (type) => `/categories/${type}`,

  // Incomes
  GET_ALL_INCOMES: "/incomes",
  GET_ALL_INCOMES_HISTORY: "/incomes/all",
  ADD_INCOME: "/incomes",
  DELETE_INCOME: (incomeId) => `/incomes/${incomeId}`,
  INCOME_EXCEL_DOWNLOAD: "/excel/download/income",
  EMAIL_INCOME_DETAILS: "/email/income-excel",

  // Expenses
  GET_ALL_EXPENSES: "/expenses",
  GET_ALL_EXPENSES_HISTORY: "/expenses/all",
  ADD_EXPENSE: "/expenses",
  DELETE_EXPENSE: (expenseId) => `/expenses/${expenseId}`,
  EXPENSE_EXCEL_DOWNLOAD: "/excel/download/expense",
  EMAIL_EXPENSE_DETAILS: "/email/expense-excel",

  // Dashboard & Filters
  DASHBOARD_DATA: "/dashboard",
  FILTER_TRANSACTIONS: "/filter",

  // Cloudinary
  UPLOAD_IMAGE: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
};