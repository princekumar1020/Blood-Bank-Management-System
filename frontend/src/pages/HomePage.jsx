import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main className="page home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Save Lives, Donate Blood</h1>
          <p className="hero-subtitle">
            Modern blood bank management system connecting donors with recipients. Join our
            community and make a difference today.
          </p>

          <div className="hero-actions">
            <Link to="/auth" className="primary">Become a Donor</Link>
            <Link to="/auth" className="secondary">Request Blood</Link>
          </div>
        </div>

        <div className="hero-illustration" aria-hidden="true" />
      </section>

      <section className="stat-strip">
        <div className="stat">
          <div className="stat-value">15,000+</div>
          <div className="stat-label">Active Donors</div>
        </div>
        <div className="stat">
          <div className="stat-value">50,000+</div>
          <div className="stat-label">Lives Saved</div>
        </div>
        <div className="stat">
          <div className="stat-value">24/7</div>
          <div className="stat-label">Availability</div>
        </div>
        <div className="stat">
          <div className="stat-value">100+</div>
          <div className="stat-label">Blood Banks</div>
        </div>
      </section>

      <section className="why">
        <h2>Why Choose Us</h2>
        <p className="why-subtitle">Comprehensive blood bank management at your fingertips</p>

        <div className="features">
          <div className="feature">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21c-4.97 0-9-4.03-9-9 0-1.25.26-2.44.74-3.53L12 11l8.26-2.53c.48 1.09.74 2.28.74 3.53 0 4.97-4.03 9-9 9z" />
                <path d="M12 7v4" />
                <path d="M10 9h4" />
              </svg>
            </div>
            <h3>Easy Donation Process</h3>
            <p>Schedule appointments, track your donation history, and get certificates instantly.</p>
          </div>

          <div className="feature">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
                <path d="M6 6v12" />
              </svg>
            </div>
            <h3>Real-time Inventory</h3>
            <p>Live tracking of blood types and quantities. Get alerts when blood is urgently needed.</p>
          </div>

          <div className="feature">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 1-12 0" />
                <path d="M12 14v7" />
                <path d="M9 21h6" />
                <path d="M5 8h14" />
                <path d="M7 12h10" />
              </svg>
            </div>
            <h3>Community Network</h3>
            <p>Connect with donors and recipients. Build a life-saving community together.</p>
          </div>

          <div className="feature">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1l3 5h-6l3-5z" />
                <path d="M6 8v6a6 6 0 1 0 12 0V8" />
                <path d="M9 14h6" />
              </svg>
            </div>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and protected. We prioritize your privacy and security.</p>
          </div>

          <div className="feature">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2l-1 7h7l-6 13 1-7h-7l6-13z" />
              </svg>
            </div>
            <h3>Quick Response</h3>
            <p>Emergency blood requests are processed immediately with instant notifications.</p>
          </div>

          <div className="feature">
            <div className="feature-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z" />
              </svg>
            </div>
            <h3>Recognition Program</h3>
            <p>Earn certificates and badges for your contributions. Become a regular donor hero.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works how-it-works-section">
        <h2>How It Works</h2>
        <p className="subtitle">Simple steps to save lives</p>
        <div className="steps-container">
          <div className="steps-column donors-column">
            <h3>For Donors</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h4>Sign Up & Verify</h4>
                <p>Create your account and complete your donor profile</p>
              </div> 
              <div className="step">
                <div className="step-number">2</div>
                <h4>Schedule Appointment</h4>
                <p>Choose convenient date and location for donation</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h4>Donate Blood</h4>
                <p>Visit the center and complete the donation process</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h4>Get Certificate</h4>
                <p>Receive digital certificate and become a regular donor</p>
              </div>
            </div>
          </div>
          <div className="steps-column recipients-column">
            <h3>For Recipients</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h4>Register Account</h4>
                <p>Sign up and provide necessary medical information</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h4>Submit Request</h4>
                <p>Request specific blood type with required details</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h4>Track Request</h4>
                <p>Monitor request status and get real-time updates</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h4>Receive Blood</h4>
                <p>Get notified when blood is available for collection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Join thousands of donors and recipients in our life-saving community</p>
        <Link to="/auth" className="primary">Get Started Now</Link>
      </section>
    </main>
  )
}
