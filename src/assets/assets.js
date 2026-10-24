import logo from "./logo.png";
import login_bg from "./login_bg.png";
import {
  FunnelPlus,
  List,
  Wallet,
  Coins,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

export const assets = {
  logo,
  login_bg,
};

export const SIDE_BAR_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "AI Coach & Tasks",
    icon: Sparkles,
    path: "/tasks",
  },
  {
    id: "03",
    label: "Category",
    icon: List,
    path: "/category",
  },
  {
    id: "04",
    label: "Income",
    icon: Wallet,
    path: "/income",
  },
  {
    id: "05",
    label: "Expense",
    icon: Coins,
    path: "/expense",
  },
  {
    id: "06",
    label: "Filters",
    icon: FunnelPlus,
    path: "/filter",
  },
];