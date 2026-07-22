const Card = ({ className = '', children, ...props }) => {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
