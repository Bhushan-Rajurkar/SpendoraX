import moment from "moment";

/**
 * Gamified Task Categories
 */
export const TASK_CATEGORIES = {
  HABITS: "Health & Daily Habits",
  COMMUTE: "Smart Commute",
  FOOD: "Food & Dining",
  SHOPPING: "Mindful Shopping",
  SAVINGS: "Savings & Utilities",
};

/**
 * Returns current week identifier (e.g., "2026-W42")
 */
export const getCurrentWeekId = () => {
  return moment().format("GGGG-[W]WW");
};

/**
 * Determines whether user is in Week 1 (observation phase) or Week 2+
 */
export const getUserWeekStatus = (userCreatedAt, forcedWeek = null) => {
  if (forcedWeek !== null) {
    return { isWeek1: forcedWeek === 1, currentWeekNumber: forcedWeek, daysActive: forcedWeek * 7 };
  }

  // Check stored user creation date or fallback to first transaction date
  const storedDate = localStorage.getItem("user_joined_date") || userCreatedAt;
  let joinedMoment = storedDate ? moment(storedDate) : null;

  if (!joinedMoment || !joinedMoment.isValid()) {
    // Save now as joined date
    const now = moment().toISOString();
    localStorage.setItem("user_joined_date", now);
    joinedMoment = moment(now);
  }

  const daysActive = Math.max(1, moment().diff(joinedMoment, "days") + 1);
  const currentWeekNumber = Math.ceil(daysActive / 7);
  const isWeek1 = currentWeekNumber <= 1;

  return {
    isWeek1,
    currentWeekNumber,
    daysActive,
    daysRemainingInWeek: Math.max(1, 7 - (daysActive % 7 || 7)),
  };
};

/**
 * Analyzes expenses to extract spending patterns
 */
export const analyzeSpendingHabits = (expenses = []) => {
  let coffeeCount = 0;
  let coffeeTotal = 0;
  let travelCount = 0;
  let travelTotal = 0;
  let foodCount = 0;
  let foodTotal = 0;
  let shoppingCount = 0;
  let shoppingTotal = 0;
  let totalExpense = 0;

  expenses.forEach((item) => {
    const name = (item.name || "").toLowerCase();
    const cat = (item.categoryName || "").toLowerCase();
    const amt = Number(item.amount || 0);
    totalExpense += amt;

    // Coffee / Tea / Cafe
    if (
      name.includes("coffee") ||
      name.includes("tea") ||
      name.includes("chai") ||
      name.includes("cafe") ||
      name.includes("starbucks") ||
      cat.includes("coffee")
    ) {
      coffeeCount += 1;
      coffeeTotal += amt;
    }

    // Travel / Commute / Cabs / Fuel
    if (
      name.includes("uber") ||
      name.includes("ola") ||
      name.includes("cab") ||
      name.includes("taxi") ||
      name.includes("fuel") ||
      name.includes("petrol") ||
      cat.includes("travel") ||
      cat.includes("transport")
    ) {
      travelCount += 1;
      travelTotal += amt;
    }

    // Food / Dining / Takeaways
    if (
      name.includes("swiggy") ||
      name.includes("zomato") ||
      name.includes("restaurant") ||
      name.includes("dinner") ||
      name.includes("lunch") ||
      name.includes("burger") ||
      name.includes("pizza") ||
      cat.includes("food") ||
      cat.includes("dining")
    ) {
      foodCount += 1;
      foodTotal += amt;
    }

    // Shopping / Impulse
    if (
      name.includes("amazon") ||
      name.includes("flipkart") ||
      name.includes("cloth") ||
      name.includes("shop") ||
      cat.includes("shopping")
    ) {
      shoppingCount += 1;
      shoppingTotal += amt;
    }
  });

  return {
    coffeeCount,
    coffeeTotal,
    travelCount,
    travelTotal,
    foodCount,
    foodTotal,
    shoppingCount,
    shoppingTotal,
    totalExpense,
  };
};

/**
 * Generates 20 Tailored Gamified Tasks based on analysis
 */
export const generateWeeklyTasks = (expenses = [], weekId = getCurrentWeekId()) => {
  const analysis = analyzeSpendingHabits(expenses);
  const tasks = [];

  // 1-4: Coffee & Health Habits (Personalized based on user habit)
  if (analysis.coffeeCount >= 3 || analysis.coffeeTotal > 400) {
    tasks.push({
      id: "task_coffee_1",
      title: "☕ Coffee Moderation Goal",
      description: "Limit coffee/tea to 4 or 5 cups this week instead of excess. Save money and stay hydrated!",
      category: TASK_CATEGORIES.HABITS,
      xp: 60,
      savings: "₹350",
      difficulty: "Easy",
    });
    tasks.push({
      id: "task_coffee_2",
      title: "🍵 Home Brewing Hero",
      description: "Brew your morning caffeine at home on at least 3 workdays instead of takeaway cafes.",
      category: TASK_CATEGORIES.HABITS,
      xp: 50,
      savings: "₹250",
      difficulty: "Easy",
    });
  } else {
    tasks.push({
      id: "task_coffee_gen_1",
      title: "💧 Daily Water Goal Before Beverage",
      description: "Drink a tall glass of water before reaching for coffee or soda to curb impulse drink buys.",
      category: TASK_CATEGORIES.HABITS,
      xp: 40,
      savings: "₹150",
      difficulty: "Easy",
    });
    tasks.push({
      id: "task_coffee_gen_2",
      title: "🍎 Healthy Snack Switch",
      description: "Swap an expensive processed snack with fresh fruit or dry snacks from home.",
      category: TASK_CATEGORIES.HABITS,
      xp: 45,
      savings: "₹180",
      difficulty: "Easy",
    });
  }

  tasks.push({
    id: "task_health_3",
    title: "🚶 Walk Short Errand Distances",
    description: "Walk or cycle for errands under 1.5 km instead of booking a vehicle or ordering quick delivery.",
    category: TASK_CATEGORIES.HABITS,
    xp: 50,
    savings: "₹120",
    difficulty: "Easy",
  });

  tasks.push({
    id: "task_health_4",
    title: "🧘 Zero-Cost Outdoor Fitness",
    description: "Complete a 20-minute jog, stretch, or home workout instead of paying for a drop-in fitness class.",
    category: TASK_CATEGORIES.HABITS,
    xp: 40,
    savings: "₹300",
    difficulty: "Easy",
  });

  // 5-8: Commute & Travel (Personalized)
  if (analysis.travelCount >= 2 || analysis.travelTotal > 500) {
    tasks.push({
      id: "task_travel_1",
      title: "🚌 Public Transit Quest",
      description: "Take the bus, metro, or carpool for at least 2 commute trips this week instead of private cabs.",
      category: TASK_CATEGORIES.COMMUTE,
      xp: 75,
      savings: "₹450",
      difficulty: "Medium",
    });
    tasks.push({
      id: "task_travel_2",
      title: "🚗 Combined Errand Run",
      description: "Bundle all your weekly outside errands into a single trip to save fuel and commute fares.",
      category: TASK_CATEGORIES.COMMUTE,
      xp: 50,
      savings: "₹200",
      difficulty: "Easy",
    });
  } else {
    tasks.push({
      id: "task_travel_gen_1",
      title: "🚲 Eco-Transit Trial",
      description: "Try walking or public transport for at least one leisure trip this weekend.",
      category: TASK_CATEGORIES.COMMUTE,
      xp: 50,
      savings: "₹150",
      difficulty: "Easy",
    });
    tasks.push({
      id: "task_travel_gen_2",
      title: "⛽ Fuel Economy Check",
      description: "Ensure proper vehicle tire pressure or service to optimize fuel consumption by 5-10%.",
      category: TASK_CATEGORIES.COMMUTE,
      xp: 40,
      savings: "₹200",
      difficulty: "Easy",
    });
  }

  tasks.push({
    id: "task_travel_3",
    title: "🚖 Surge-Fare Dodger",
    description: "Avoid booking cabs during peak surge pricing hours — wait 15 minutes or walk to a nearby stop.",
    category: TASK_CATEGORIES.COMMUTE,
    xp: 55,
    savings: "₹180",
    difficulty: "Medium",
  });

  tasks.push({
    id: "task_travel_4",
    title: "🗺️ Smart Route Planning",
    description: "Check navigation traffic before heading out to choose the lowest-fuel, toll-free route.",
    category: TASK_CATEGORIES.COMMUTE,
    xp: 40,
    savings: "₹100",
    difficulty: "Easy",
  });

  // 9-12: Food & Cooking (Personalized)
  if (analysis.foodCount >= 3 || analysis.foodTotal > 800) {
    tasks.push({
      id: "task_food_1",
      title: "🍳 4-Day Home Cook Challenge",
      description: "Cook dinner at home on at least 4 nights this week. Delicious, healthy, and budget-friendly!",
      category: TASK_CATEGORIES.FOOD,
      xp: 80,
      savings: "₹800",
      difficulty: "Medium",
    });
    tasks.push({
      id: "task_food_2",
      title: "🚫 48-Hour Zero Delivery Sprint",
      description: "Go 2 consecutive days without ordering from food delivery apps (Swiggy/Zomato).",
      category: TASK_CATEGORIES.FOOD,
      xp: 65,
      savings: "₹450",
      difficulty: "Medium",
    });
  } else {
    tasks.push({
      id: "task_food_gen_1",
      title: "🍱 Pack a Workday Lunch",
      description: "Prepare and pack lunch from home for at least 2 work/study days.",
      category: TASK_CATEGORIES.FOOD,
      xp: 60,
      savings: "₹300",
      difficulty: "Easy",
    });
    tasks.push({
      id: "task_food_gen_2",
      title: "🥘 One-Pot Batch Cook",
      description: "Cook a double batch of your favorite stew, dal, or pasta to have leftovers ready for busy days.",
      category: TASK_CATEGORIES.FOOD,
      xp: 50,
      savings: "₹250",
      difficulty: "Easy",
    });
  }

  tasks.push({
    id: "task_food_3",
    title: "📋 Strict Grocery List Run",
    description: "Go grocery shopping with a strict written list and buy zero items outside that list.",
    category: TASK_CATEGORIES.FOOD,
    xp: 50,
    savings: "₹350",
    difficulty: "Easy",
  });

  tasks.push({
    id: "task_food_4",
    title: "🧊 Fridge Inventory First",
    description: "Check existing ingredients in your fridge/pantry and make a meal with what you already have.",
    category: TASK_CATEGORIES.FOOD,
    xp: 45,
    savings: "₹200",
    difficulty: "Easy",
  });

  // 13-16: Mindful Shopping & Impulse Control
  tasks.push({
    id: "task_shop_1",
    title: "⏳ The 24-Hour Cooling Rule",
    description: "Pause and wait 24 hours before completing any non-essential purchase over ₹500.",
    category: TASK_CATEGORIES.SHOPPING,
    xp: 70,
    savings: "₹600",
    difficulty: "Medium",
  });

  tasks.push({
    id: "task_shop_2",
    title: "📱 Unsubscribe from Sale Alerts",
    description: "Unsubscribe from promotional emails or turn off notifications for shopping apps that tempt you.",
    category: TASK_CATEGORIES.SHOPPING,
    xp: 40,
    savings: "₹400",
    difficulty: "Easy",
  });

  tasks.push({
    id: "task_shop_3",
    title: "🔍 Price Comparison Before Buying",
    description: "Check at least 2 alternative platforms or stores before buying any household product.",
    category: TASK_CATEGORIES.SHOPPING,
    xp: 45,
    savings: "₹150",
    difficulty: "Easy",
  });

  tasks.push({
    id: "task_shop_4",
    title: "🛍️ Use Up Before Replacing",
    description: "Finish your existing bottle of shampoo, soap, or pantry staple before buying a replacement.",
    category: TASK_CATEGORIES.SHOPPING,
    xp: 40,
    savings: "₹200",
    difficulty: "Easy",
  });

  // 17-20: Savings & Utilities Habits
  tasks.push({
    id: "task_save_1",
    title: "⚡ Phantom Power Patrol",
    description: "Unplug phone chargers and turn off power strips at night to avoid phantom electricity draw.",
    category: TASK_CATEGORIES.SAVINGS,
    xp: 40,
    savings: "₹100",
    difficulty: "Easy",
  });

  tasks.push({
    id: "task_save_2",
    title: "📱 Subscription Audit",
    description: "Review recurring monthly subscriptions (OTT, cloud, apps) and cancel at least one unused service.",
    category: TASK_CATEGORIES.SAVINGS,
    xp: 80,
    savings: "₹499",
    difficulty: "Medium",
  });

  tasks.push({
    id: "task_save_3",
    title: "🪙 Micro-Vault Transfer",
    description: "Transfer ₹100 or spare change directly into your savings account as a reward for a good financial choice.",
    category: TASK_CATEGORIES.SAVINGS,
    xp: 60,
    savings: "₹100",
    difficulty: "Easy",
  });

  tasks.push({
    id: "task_save_4",
    title: "🎯 Sunday No-Spend Day",
    description: "Designate Sunday as a No-Spend day where ₹0 is spent on non-essential items.",
    category: TASK_CATEGORIES.SAVINGS,
    xp: 90,
    savings: "₹700",
    difficulty: "Medium",
  });

  // Ensure exactly 20 tasks
  return tasks.slice(0, 20).map((task) => ({
    ...task,
    weekId,
    completed: false,
    completedAt: null,
  }));
};

/**
 * Loads tasks for current week from localStorage or initializes them
 */
export const getOrInitWeeklyTasks = (expenses = [], weekId = getCurrentWeekId()) => {
  const storageKey = `mm_weekly_tasks_${weekId}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === 20) {
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse stored tasks", e);
    }
  }

  // Generate new 20 tasks
  const freshTasks = generateWeeklyTasks(expenses, weekId);
  localStorage.setItem(storageKey, JSON.stringify(freshTasks));
  return freshTasks;
};

/**
 * Saves tasks to localStorage
 */
export const saveWeeklyTasks = (tasks = [], weekId = getCurrentWeekId()) => {
  const storageKey = `mm_weekly_tasks_${weekId}`;
  localStorage.setItem(storageKey, JSON.stringify(tasks));
};

/**
 * Calculates user rank & level based on earned XP
 */
export const calculateLevelFromXp = (xp = 0) => {
  const level = Math.floor(xp / 250) + 1;
  const currentLevelXp = xp % 250;
  const xpNeeded = 250;
  const progress = Math.min(100, Math.round((currentLevelXp / xpNeeded) * 100));

  let title = "Novice Saver";
  if (level >= 6) title = "Wealth Master 👑";
  else if (level >= 4) title = "Budget Knight 🛡️";
  else if (level >= 3) title = "Frugal Strategist ⚡";
  else if (level >= 2) title = "Smart Planner 🎯";

  return { level, currentLevelXp, xpNeeded, progress, title, totalXp: xp };
};

/**
 * Financial AI Chatbot response generator
 */
export const generateFinancialChatResponse = (
  message = "",
  financialContext = {}
) => {
  const q = message.toLowerCase().trim();
  const { totalBalance = 0, totalIncome = 0, totalExpense = 0, expenses = [], tasks = [] } =
    financialContext;

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length || 20;

  // Analysis of spending
  const analysis = analyzeSpendingHabits(expenses);

  // 1. Task progress question
  if (q.includes("task") || q.includes("challenge") || q.includes("progress")) {
    return `🎯 **Your Weekly Tasks Progress:**\nYou have completed **${completedTasks}/${totalTasks} tasks** this week! Keep going! Every small habit adds up. Check out the "AI Coach & Tasks" tab to mark off today's milestones.`;
  }

  // 2. Coffee / beverage inquiry
  if (q.includes("coffee") || q.includes("tea") || q.includes("drink")) {
    return `☕ **Coffee & Beverage Analysis:**\nYou have logged **${analysis.coffeeCount} coffee/beverage transactions** totalling **₹${analysis.coffeeTotal}** recently.\n\n💡 *Actionable Tip:* If you drink 5–6 coffees a day, aim for **4 or 5 cups** instead. Replace one afternoon cup with refreshing water or green tea. That alone saves ~₹1,500/month and improves hydration!`;
  }

  // 3. Travel / commute inquiry
  if (q.includes("travel") || q.includes("commute") || q.includes("cab") || q.includes("transport") || q.includes("uber") || q.includes("ola")) {
    return `🚌 **Commute & Travel Tip:**\nYou have logged **${analysis.travelCount} transit expenses** (₹${analysis.travelTotal}).\n\n💡 *Actionable Tip:* Try taking public transit (metro/bus) for 2 trips this week instead of surge-priced cabs. For errands under 1 km, walking is free and boosts your daily steps!`;
  }

  // 4. Food / Dining / Takeaway inquiry
  if (q.includes("food") || q.includes("zomato") || q.includes("swiggy") || q.includes("eat") || q.includes("dinner")) {
    return `🍳 **Food & Dining Analysis:**\nFood expenses accounted for **₹${analysis.foodTotal}** across **${analysis.foodCount} orders**.\n\n💡 *Actionable Tip:* Try the **4-Day Home Cook Challenge**! Cooking dinner at home 4 days a week can easily save ₹2,000–₹4,000 every month compared to food delivery apps.`;
  }

  // 5. Overall budget summary
  if (q.includes("how am i doing") || q.includes("budget") || q.includes("summary") || q.includes("balance") || q.includes("spend")) {
    const savingsRatio = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
    return `📊 **Your Financial Snapshot:**\n- **Total Income:** ₹${Number(totalIncome).toLocaleString()}\n- **Total Expenses:** ₹${Number(totalExpense).toLocaleString()}\n- **Net Balance:** ₹${Number(totalBalance).toLocaleString()}\n- **Savings Rate:** ${savingsRatio}%\n\n${
      savingsRatio >= 20
        ? "🌟 Great job! You are saving over 20% of your income. Keep building your wealth buffer!"
        : "💡 Aim to cut 10% of unnecessary daily spendings to push your savings rate above 20%."
    }`;
  }

  // 6. How to save money / general tips
  if (q.includes("save") || q.includes("tips") || q.includes("advice")) {
    return `💡 **Top 3 Money-Saving Rules for This Week:**\n1. **The 24-Hour Cooling Rule:** Wait 24 hours before buying anything non-essential over ₹500.\n2. **Swap One Cab for Metro/Bus:** Saves ₹150–₹300 per trip.\n3. **Audit Unused Subscriptions:** Check streaming or gym apps you haven't used this month.\n\nCheck your **Weekly Tasks** tab for personalized gamified challenges!`;
  }

  // Default friendly response
  return `👋 Hi there! I am your **SpendoraX AI Coach**.\n\nI can analyze your spending patterns, guide your **20 Weekly Gamified Tasks**, and help you cut unnecessary expenses on coffee, commute, food delivery, and impulse shopping.\n\nTry asking me:\n- *"How much did I spend on food or coffee?"*\n- *"What tasks should I focus on this week?"*\n- *"How am I doing with my budget?"*`;
};
