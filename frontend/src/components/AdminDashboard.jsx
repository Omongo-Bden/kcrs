import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/reports/');
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports", error);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="admin-container">
      <h2>Active Reports — Kole District</h2>
      <table className="report-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Location</th>
            <th>Status</th>
            <th>Evidence</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>KD-{r.id}</td>
              <td>{r.report_type}</td>
              <td>{r.location}</td>
              <td><span className={`badge ${r.status}`}>{r.status}</span></td>
              <td>
                {r.evidence ? (
                  <a href={r.evidence} target="_blank" rel="noreferrer">View File</a>
                ) : (
                  "No File"
                )}
              </td>
              <td><span className={`badge ${r.status}`}>{r.status}</span></td>
              <td>{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;