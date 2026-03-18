import React from 'react'

export default function DashboardPage({ onLogout }) {
  return (
    <main className="page dashboard-page">
      <section className="dashboard-hero">
        <h1>Welcome back!</h1>
        <p>
          This is your dashboard. From here, you can track your donations, view active requests,
          and manage your profile.
        </p>
        <button className="primary" onClick={onLogout}>
          Log out
        </button>
      </section>

      <section className="dashboard-cards">
        <div className="card">
          <h3>Your Donations</h3>
          <p>No donations recorded yet. Start by becoming a donor!</p>
        </div>
        <div className="card">
          <h3>Your Requests</h3>
          <p>No active requests. Request blood when you need it.</p>
        </div>
      </section>
    </main>
  )
}
