class CustomHeader extends HTMLElement {
  connectedCallback() {
    const activePage = this.getAttribute('active') || 'home';
    
    this.innerHTML = `
      <div class="header-info-bar">
        <div class="container header-info-container">
          <a href="index.html" class="logo-section">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                <path d="m8.5 8.5 7 7"/>
              </svg>
            </div>
            <div class="logo-text">
              <h1>Stockton Pharmacy</h1>
              <p>where wellness meets convenience</p>
            </div>
          </a>
          
          <div class="contact-details-bar">
            <div class="contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div class="contact-item-text">
                <span class="contact-item-label">Phone:</span>
                <span class="contact-item-value red-text">209-868-1555</span>
              </div>
            </div>
            
            <div class="contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <div class="contact-item-text">
                <span class="contact-item-label">Fax:</span>
                <span class="contact-item-value red-text">209-868-1557</span>
              </div>
            </div>

            <div class="contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <div class="contact-item-text">
                <span class="contact-item-label">Email:</span>
                <span class="contact-item-value"><a href="mailto:info@stocktonpharmacy.com">info@stocktonpharmacy.com</a></span>
              </div>
            </div>
            
            <div class="contact-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div class="contact-item-text">
                <span class="contact-item-label">Visit Us at:</span>
                <span class="contact-item-value">1140 W Hammer Lane, Suite 106<br>Stockton, CA 95209</span>
              </div>
            </div>
            
            <button class="lang-selector">
              <span>us EN</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <nav class="nav-bar">
        <div class="container nav-container">
          <ul class="nav-links">
            <li><a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a></li>
            <li><a href="about.html" class="${activePage === 'about' ? 'active' : ''}">About Us</a></li>
            <li><a href="services.html" class="${activePage === 'services' ? 'active' : ''}">Services</a></li>
            <li><a href="refill.html" class="${activePage === 'refill' ? 'active' : ''}">Refill RX</a></li>
            <li><a href="resources.html" class="${activePage === 'resources' ? 'active' : ''}">Resources</a></li>
            <li><a href="contact.html" class="${activePage === 'contact' ? 'active' : ''}">Contact Us</a></li>
          </ul>
          
          <button class="mobile-menu-btn" aria-label="Toggle navigation menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>
    `;
    
    // Add mobile toggle behavior
    const menuBtn = this.querySelector('.mobile-menu-btn');
    const navLinks = this.querySelector('.nav-links');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        menuBtn.setAttribute('aria-expanded', isExpanded);
        
        // Dynamic hamburger icon state update
        if (isExpanded) {
          menuBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          `;
        } else {
          menuBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          `;
        }
      });
    }
  }
}

customElements.define('custom-header', CustomHeader);
