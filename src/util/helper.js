/**
 * Helper utilities for data formatting, chart preparation, client-side exports, and email sharing
 */

export const formatCurrency = (amount = 0, currency = "₹") => {
  const num = Number(amount || 0);
  return `${currency}${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Sanitizes and extracts a valid URL for emoji / icon images
 */
export const getIconUrl = (icon) => {
  if (!icon || typeof icon !== "string") return null;
  const trimmed = icon.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith("dn.jsdelivr.net")) {
    return `https://c${trimmed}`;
  }
  if (trimmed.startsWith("cdn.") || trimmed.includes("jsdelivr.net")) {
    return `https://${trimmed}`;
  }
  if (
    trimmed.includes("/") ||
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".svg") ||
    trimmed.endsWith(".jpg") ||
    trimmed.endsWith(".webp")
  ) {
    return trimmed.startsWith("/") ? trimmed : `https://${trimmed}`;
  }
  return null;
};

/**
 * Prepares income transactions for Recharts line/area charts
 */
export const prepareIncomeLineChartData = (transactions = [], categories = []) => {
  if (!Array.isArray(transactions) || !transactions.length) return [];

  const incomeMap = {};

  transactions.forEach((transaction) => {
    if (!transaction || !transaction.date) return;
    const dateKey = new Date(transaction.date).toISOString().split("T")[0];

    if (!incomeMap[dateKey]) {
      incomeMap[dateKey] = {
        totalIncome: 0,
        details: [],
      };
    }

    const amount = Number(transaction.amount || 0);
    incomeMap[dateKey].totalIncome += amount;

    const matchedCategory = categories.find(
      (cat) => String(cat.id || cat._id) === String(transaction.categoryId)
    );

    incomeMap[dateKey].details.push({
      category: matchedCategory?.name || transaction.categoryName || transaction.name || "Income",
      name: transaction.name,
      amount: amount,
    });
  });

  const sortedDates = Object.keys(incomeMap).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return sortedDates.map((dateKey) => ({
    date: new Date(dateKey).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    totalIncome: incomeMap[dateKey].totalIncome,
    details: incomeMap[dateKey].details,
  }));
};

/**
 * Prepares expense transactions for Recharts line/area charts
 */
export const prepareExpenseLineChartData = (transactions = [], categories = []) => {
  if (!Array.isArray(transactions) || !transactions.length) return [];

  const expenseMap = {};

  transactions.forEach((transaction) => {
    if (!transaction || !transaction.date) return;
    const dateKey = new Date(transaction.date).toISOString().split("T")[0];

    if (!expenseMap[dateKey]) {
      expenseMap[dateKey] = {
        totalExpense: 0,
        details: [],
      };
    }

    const amount = Number(transaction.amount || 0);
    expenseMap[dateKey].totalExpense += amount;

    const matchedCategory = categories.find(
      (cat) => String(cat.id || cat._id) === String(transaction.categoryId)
    );

    expenseMap[dateKey].details.push({
      category: matchedCategory?.name || transaction.categoryName || transaction.name || "Expense",
      name: transaction.name,
      amount: amount,
    });
  });

  const sortedDates = Object.keys(expenseMap).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return sortedDates.map((dateKey) => ({
    date: new Date(dateKey).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    totalExpense: expenseMap[dateKey].totalExpense,
    details: expenseMap[dateKey].details,
  }));
};

/**
 * Groups transactions by category for Donut/Pie charts
 */
export const prepareCategoryPieData = (transactions = [], categories = []) => {
  if (!Array.isArray(transactions) || !transactions.length) return [];

  const catMap = {};

  transactions.forEach((tx) => {
    const matchedCategory = categories.find(
      (c) => String(c.id || c._id) === String(tx.categoryId)
    );
    const catName = tx.categoryName || matchedCategory?.name || "General";
    catMap[catName] = (catMap[catName] || 0) + Number(tx.amount || 0);
  });

  const colors = [
    "#6366F1", "#EC4899", "#10B981", "#F59E0B", "#8B5CF6",
    "#06B6D4", "#EF4444", "#14B8A6", "#F97316", "#84CC16"
  ];

  return Object.entries(catMap).map(([name, value], idx) => ({
    name,
    value,
    color: colors[idx % colors.length],
  }));
};

/**
 * Downloads data as a CSV file in browser
 */
export const exportTransactionsToCsv = (transactions = [], filename = "transactions.csv") => {
  if (!transactions.length) return false;

  const headers = ["ID", "Date", "Name", "Category", "Amount", "Type"];
  const rows = transactions.map((t) => [
    t.id || "",
    t.date || "",
    `"${(t.name || "").replace(/"/g, '""')}"`,
    `"${(t.categoryName || t.category || "General").replace(/"/g, '""')}"`,
    t.amount || 0,
    t.type || (t.totalExpense !== undefined ? "expense" : "income"),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};

/**
 * Prepares formatted text summary for email sharing
 */
export const generateReportEmailContent = (type = "income", transactions = [], user = {}) => {
  const isIncome = type === "income";
  const title = isIncome ? "Income Summary Statement" : "Expense Summary Statement";
  const totalAmount = transactions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const subject = `SpendoraX - ${title} (${new Date().toLocaleDateString("en-IN")})`;

  // Concise body optimized for Gmail compose & mailto URL length safety (<1,000 chars)
  let conciseBody = `Hello,\n\nHere is the financial statement generated from SpendoraX:\n\n`;
  conciseBody += `---------------------------------\n`;
  conciseBody += `STATEMENT OVERVIEW:\n`;
  conciseBody += `• Type: ${isIncome ? "Income" : "Expense"}\n`;
  conciseBody += `• Total Amount: ₹${totalAmount.toLocaleString("en-IN")}\n`;
  conciseBody += `• Total Records: ${transactions.length}\n`;
  conciseBody += `• Account Owner: ${user?.fullName || "SpendoraX User"} (${user?.email || ""})\n`;
  conciseBody += `• Date Generated: ${new Date().toLocaleDateString("en-IN")}\n`;
  conciseBody += `---------------------------------\n\n`;

  conciseBody += `Key Highlights (Top 5 Records):\n`;
  const previewList = transactions.slice(0, 5);
  previewList.forEach((t, i) => {
    conciseBody += `${i + 1}. ${t.name || "Item"}: ₹${Number(t.amount || 0).toLocaleString("en-IN")} (${t.categoryName || "General"})\n`;
  });

  if (transactions.length > 5) {
    conciseBody += `...and ${transactions.length - 5} more transactions in attached/exported statement.\n`;
  }

  conciseBody += `\nBest regards,\n${user?.fullName || "SpendoraX User"}\nGenerated via SpendoraX`;

  // Full detailed report (for copy to clipboard or direct export)
  let fullBody = `Hello,\n\nHere is my ${title} generated from SpendoraX.\n\n`;
  fullBody += `=====================================\n`;
  fullBody += `SPENDORAX STATEMENT SUMMARY\n`;
  fullBody += `• Total ${isIncome ? "Income" : "Expense"}: ₹${totalAmount.toLocaleString("en-IN")}\n`;
  fullBody += `• Total Transactions: ${transactions.length}\n`;
  fullBody += `• User: ${user?.fullName || "SpendoraX User"} (${user?.email || ""})\n`;
  fullBody += `• Date: ${new Date().toLocaleDateString("en-IN")}\n`;
  fullBody += `=====================================\n\n`;
  fullBody += `All Transactions:\n`;
  transactions.forEach((t, i) => {
    fullBody += `${i + 1}. ${t.name || "Item"} | ₹${Number(t.amount || 0).toLocaleString("en-IN")} | ${t.categoryName || "General"} | ${t.date || "N/A"}\n`;
  });
  fullBody += `\nBest regards,\n${user?.fullName || "SpendoraX User"}\nSpendoraX - Personal Finance & Habit Coach`;

  return { subject, body: conciseBody, fullBody, totalAmount };
};

/**
 * Opens Gmail compose in new tab with pre-filled subject, recipient, and body
 */
export const openGmailCompose = (toEmail = "", subject = "", body = "") => {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    toEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  const opened = window.open(gmailUrl, "_blank", "noopener,noreferrer");
  if (!opened || opened.closed || typeof opened.closed === "undefined") {
    // If popup was blocked by browser, redirect in same window or notify
    window.location.href = gmailUrl;
  }
  return true;
};

/**
 * Opens system default mail app via mailto link
 */
export const openMailto = (toEmail = "", subject = "", body = "") => {
  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
  return true;
};