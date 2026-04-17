export default function SectionCard({
  title,
  count,
  countClassName = "",
  children,
  footer,
  className = "",
}) {
  return (
    <div
      className={`rounded-[28px] bg-white p-6 shadow-sm border border-[#F0E7D8] flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#171717]">{title}</h3>

        {count !== undefined && (
          <span className={`text-xs px-3 py-1 rounded-full ${countClassName}`}>
            {count}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0">{children}</div>

      {footer ? <div className="pt-4">{footer}</div> : null}
    </div>
  );
}