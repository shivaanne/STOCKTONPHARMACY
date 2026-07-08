class CustomFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section class="switch-banner">
        <div class="container switch-content">
          <div class="switch-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
              <path d="m8.5 8.5 7 7"/>
            </svg>
          </div>
          <h2 class="switch-title">Ready to make the switch?</h2>
          <p class="switch-description">Transferring your prescriptions is easy — we handle the paperwork. You just enjoy better service.</p>
          <div class="switch-ctas">
            <a href="contact.html?subject=Transfer%20Prescription" class="btn btn-primary">Transfer my Rx</a>
            <a href="refill.html" class="btn btn-outline">Request a refill</a>
          </div>
        </div>
      </section>

      <footer class="main-footer">
        <div class="container footer-grid">
          <div class="footer-col">
            <div class="logo-section">
              <div class="logo-icon" style="width: 38px; height: 38px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                  <path d="m8.5 8.5 7 7"/>
                </svg>
              </div>
              <div class="logo-text">
                <h1 style="font-size: 18px; color: white;">Stockton Pharmacy</h1>
                <p style="font-size: 10px; color: rgba(255, 255, 255, 0.5);">where wellness meets convenience</p>
              </div>
            </div>
            <p class="footer-desc">Operated by BJRX Pharmacy LTC, LLC — proudly serving the Stockton community.</p>
          </div>
          
          <div class="footer-col">
            <h4>Contact</h4>
            <ul class="footer-contact-list">
              <li class="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>209-868-1555</span>
              </li>
              <li class="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                <span>209-868-1557</span>
              </li>
              <li class="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span><a href="mailto:info@stocktonpharmacy.com" style="color: rgba(255, 255, 255, 0.8);">info@stocktonpharmacy.com</a></span>
              </li>
              <li class="footer-contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>1140 W Hammer Lane, Suite 106<br>Stockton, CA 95209</span>
              </li>
            </ul>
          </div>
          
          <div class="footer-col">
            <h4>Hours</h4>
            <ul class="footer-hours-list">
              <li class="footer-hours-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Mon–Fri: 9:00 AM – 5:00 PM</span>
              </li>
              <li class="footer-hours-item" style="padding-left: 26px;">
                <span>Sat–Sun: Closed</span>
              </li>
            </ul>
          </div>
          
          <div class="footer-col">
            <h4>Site</h4>
            <ul class="footer-site-list">
              <li><a href="index.html">Home</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="refill.html">Refill Rx</a></li>
              <li><a href="resources.html">Resources</a></li>
              <li><a href="contact.html">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div class="container footer-bottom">
          <p>&copy; 2026 BJRX Pharmacy LTC, LLC dba Stockton Pharmacy. All rights reserved.</p>
        </div>
      </footer>
    `;
  }
}

customElements.define('custom-footer', CustomFooter);
