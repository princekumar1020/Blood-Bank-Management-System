export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-red-700 to-red-500 text-white p-6 shadow-xl">

      <h1 className="text-3xl font-bold mb-10 tracking-wide">🩸 Blood Bank</h1>

      <ul className="space-y-5 text-lg">
        <li className="hover:bg-white/20 p-3 rounded-lg cursor-pointer transition">
          📊 Dashboard
        </li>
        <li className="hover:bg-white/20 p-3 rounded-lg cursor-pointer transition">
          👨‍⚕️ Donors
        </li>
        <li className="hover:bg-white/20 p-3 rounded-lg cursor-pointer transition">
          🧑 Recipients
        </li>
        <li className="hover:bg-white/20 p-3 rounded-lg cursor-pointer transition">
          📝 Requests
        </li>
      </ul>

    </div>
  );
}