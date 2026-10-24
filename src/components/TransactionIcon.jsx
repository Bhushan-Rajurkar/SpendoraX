import { useState } from "react";
import { getIconUrl } from "../util/helper";

const TransactionIcon = ({
  icon,
  type = "income",
  className = "w-6 h-6",
  alt = "Icon",
}) => {
  const [hasError, setHasError] = useState(false);
  const iconUrl = getIconUrl(icon);

  if (iconUrl && !hasError) {
    return (
      <img
        src={iconUrl}
        alt={alt}
        className={`${className} object-contain`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  // If it's a raw unicode emoji (e.g. 💰, 🍔)
  if (
    icon &&
    typeof icon === "string" &&
    !icon.includes("/") &&
    icon.length <= 4
  ) {
    return <span className="text-xl leading-none select-none">{icon}</span>;
  }

  // Fallback defaults
  return (
    <span className="text-xl leading-none select-none">
      {type === "income" ? "💰" : "💸"}
    </span>
  );
};

export default TransactionIcon;
