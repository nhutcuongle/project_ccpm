import { Inbox } from "lucide-react";

export default function EmptyState({ icon, title = "Không có dữ liệu", description = "", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
      <div className="w-16 h-16 rounded-2xl gradient-primary/10 flex items-center justify-center mb-4 bg-indigo-500/10">
        {icon || <Inbox size={28} className="text-indigo-400" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 text-center max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
