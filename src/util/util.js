// Function to format a number by adding separators
export const addThousandSeparator = (num) => {

    // Check if the value is null, undefined, or not a valid number
    if (num == null || isNaN(num)) return "";

    // Convert the number into a string
    const numStr = num.toString();

    // Split the number into integer and decimal parts
    // Example: 12345.67 => ["12345", "67"]
    const parts = numStr.split(".");

    // Store the part before the decimal point
    let integerPart = parts[0];

    // Store the part after the decimal point (if any)
    let fractionalPart = parts[1];

    // Take the last 3 digits from the integer part
    // Example: 1234567 => 567
    const lastThree = integerPart.substring(integerPart.length - 3);

    // Take all digits before the last 3 digits
    // Example: 1234567 => 1234
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);

    // If there are digits before the last 3 digits
    if (otherNumbers !== "") {

        // Add a separator after every 2 digits from the right side
        // Example: 1234 => 1,234 (Indian style: 12,34,567 when combined)
        const formattedOtherNumbers = otherNumbers.replace(
            /\B(?=(\d{2})+(?!\d))/g,
            ","
        );

        // Combine the formatted part with the last 3 digits
        // Example: 12,34 + 567 => 12,34,567
        integerPart = formattedOtherNumbers + "," + lastThree;
    } else {
        // If the number has only 3 digits or less, keep it as it is
        integerPart = lastThree;
    }

    // If there is a decimal part, add it back
    // Example: 12,34,567.89
    // Otherwise return only the integer part
    return fractionalPart
        ? `${integerPart}.${fractionalPart}`
        : integerPart;
};