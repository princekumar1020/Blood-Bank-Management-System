import React, { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/donations")
      .then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <p>Total Requests: {data.length}</p>
      <p>Pending: {data.filter(d => d.status === "pending").length}</p>
      <p>Completed: {data.filter(d => d.status === "completed").length}</p>
    </div>
  );
}

export default Dashboard;