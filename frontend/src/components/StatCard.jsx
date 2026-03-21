export default function StatCard({ title, value }) {
  return (
    <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">

      <h2 className="text-gray-600 text-sm">{title}</h2>

      <p className="text-3xl font-bold text-red-600 mt-2">
        {value}
      </p>

    </div>
  );
}