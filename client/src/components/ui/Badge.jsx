const badgeMap = {
  Present: 'bg-emerald-100 text-emerald-700',
  Late: 'bg-amber-100 text-amber-700',
  Absent: 'bg-rose-100 text-rose-700',
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
  Submitted: 'bg-indigo-100 text-indigo-700',
  Reviewed: 'bg-slate-100 text-slate-700',
};

const Badge = ({ status, className = '' }) => {
  const label = typeof status === 'string' ? status : String(status);
  const classes = badgeMap[label] || 'bg-slate-100 text-slate-700';
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${classes} ${className}`}>{label}</span>;
};

export default Badge;
