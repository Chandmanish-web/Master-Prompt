const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
      {icon}
      <div>
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
};

export default EmptyState;
