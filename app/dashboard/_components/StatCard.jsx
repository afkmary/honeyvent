export default function StatCard({ title, value, icon, loading = false }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border border-[#F0E7D8]">
      <div className="flex items-center justify-between mb-4 text-[#C98C00]">
        {icon}
      </div>

      <p className="text-sm text-[#7A7480] mb-1">{title}</p>

      <h2 className="text-3xl font-semibold text-[#171717]">
        {loading ? "..." : value}
      </h2>
    </div>
  );
}