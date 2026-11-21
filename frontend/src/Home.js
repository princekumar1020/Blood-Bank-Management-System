import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "./components/PublicHeader";
import FloatingBloodGroups from "./components/FloatingBloodGroups";

export default function Home() {
  return (
    <div className="public-page home-page">
      <PublicHeader />
      <FloatingBloodGroups />
      <main className="home-hero">
        <div className="home-hero-content">
          <h1>
            Donate Blood,
            <span className="home-hero-accent">Save Lives</span>
          </h1>
          <p className="home-hero-description">
            Every donation makes a difference. Connect with your community to give blood or find the support you need.
          </p>
          <div className="home-hero-actions">
            <Link to="/auth?role=donor" className="ui-btn ui-btn-primary home-hero-primary">
              Become a Donor
            </Link>
            <Link to="/auth?role=recipient" className="ui-btn ui-btn-outline">
              Request Blood
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
