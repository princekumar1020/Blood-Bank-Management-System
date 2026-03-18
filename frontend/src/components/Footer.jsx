import React from 'react'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>BloodBank Plus</h3>
          <p>Making blood donation and management easier and more efficient.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Sign Up</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>For Donors</h4>
          <ul>
            <li><a href="/eligibility">Eligibility</a></li>
            <li><a href="/benefits">Benefits</a></li>
            <li><a href="/faqs">FAQs</a></li>
            <li><a href="/guidelines">Guidelines</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/report">Report Issue</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 BloodBank Plus. All rights reserved.</p>
      </div>
    </footer>
  )
}
