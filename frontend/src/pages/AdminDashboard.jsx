import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Table from "../components/Table";

export default function AdminDashboard() {

  const data = [
    { name: "Rahul", blood: "A+", status: "pending" },
    { name: "Aman", blood: "B+", status: "approved" },
    { name: "Riya", blood: "O-", status: "rejected" }
  ];

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">
          Welcome Admin 👋
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Donors" value="120" />
          <StatCard title="Total Recipients" value="80" />
          <StatCard title="Pending Requests" value="15" />
        </div>

        {/* Table */}
        <Table data={data} />

      </div>
    </div>
  );
}