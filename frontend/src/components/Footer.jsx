import React from 'react'
import { Link } from 'react-router-dom'

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
            <li><Link to="/auth">Login</Link></li>
            <li><Link to="/auth">Sign Up</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>For Donors</h4>
          <ul>
            <li><Link to="/eligibility">Eligibility</Link></li>
            <li><Link to="/benefits">Benefits</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/guidelines">Guidelines</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/report">Report Issue</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 BloodBank Plus. All rights reserved.</p>
      </div>
    </footer>
  )
}
