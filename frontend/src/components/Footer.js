import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="simple-footer">
      <div className="footer-content">
        <a href="#">About Us</a>
        <span className="divider">|</span>
        <a href="#">Contact</a>
        <span className="divider">|</span>
        <a href="#">Privacy Policy</a>
        <span className="divider">|</span>
        <a href="#">Terms & Conditions</a>
        <span className="divider">|</span>
        <a href="#">Help</a>
      </div>
      <div className="footer-copyright">
        <p>© {new Date().getFullYear()} MarutiFlex. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;