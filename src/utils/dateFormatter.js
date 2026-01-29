/**
 * Convert ISO timestamp to: DD-MM-YYYY / hh:mm AM/PM
 * Example:
 * 2025-12-20T16:29:56.584Z → 20-12-2025 / 04:29 PM
 */
export const formatDateTime = (isoString) => {
    if (!isoString) return null;

    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, "0");

    return `${day}-${month}-${year} / ${hours}:${minutes} ${ampm}`;
};
