export default function Table({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">

      <table className="w-full">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            <th className="p-3">Name</th>
            <th>Blood</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-b hover:bg-gray-50 transition">
              
              <td className="p-3">{item.name}</td>
              <td>{item.blood}</td>

              <td>
                <span className={`px-3 py-1 rounded-full text-white text-sm ${
                  item.status === "pending"
                    ? "bg-yellow-500"
                    : item.status === "approved"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}>
                  {item.status}
                </span>
              </td>

              <td>
                <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 transition">
                  ✔
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition">
                  ✖
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}