import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);
export const formatTime = (date) => {
  const now = dayjs();
  const created = dayjs(date);

  const diffMinutes = now.diff(created, "minute");
  const diffHours = now.diff(created, "hour");
  const diffDays = now.diff(created, "day");
  const diffWeeks = now.diff(created, "week");

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${diffWeeks} tuần trước`;

  // Nếu cùng năm → hiển thị DD-MM
  if (created.year() === now.year()) {
    return created.format("DD-MM");
  }

  // Khác năm → hiển thị DD-MM-YYYY
  return created.format("DD-MM-YYYY");
};