import React, { useEffect, useState } from "react";
import API from "../services/api";

function Donations() {
  const [data, setData] = useState([]);

  const fetchData = () => {
    API.get("/donations")
      .then(res => setData(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const approve = async (id) => {
    await API.post(`/donations/approve/${id}`);
    fetchData();
  };

  const complete = async (id) => {
    await API.post(`/donations/complete/${id}`);
    fetchData();
  };

  return (
    <div>
      <h2>Donation Requests</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Blood</th>
            <th>Status</th>
            <th>Token</th>
            <th>Time</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map(d => (
            <tr key={d._id}>
              <td>{d.bloodGroup}</td>
              <td>{d.status}</td>
              <td>{d.tokenNumber || "-"}</td>
              <td>{d.appointmentTime || "-"}</td>

              <td>
                {d.status === "pending" && (
                  <button onClick={() => approve(d._id)}>
                    Approve
                  </button>
                )}

                {d.status === "approved" && (
                  <button onClick={() => complete(d._id)}>
                    Complete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
    </table>
    </div>
  );
}

export default Donations;