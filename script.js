// AbayHost redesign — interactions

// Animated stat counters
(function () {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const format = (n, target) => {
    if (target >= 100) return Math.floor(n).toLocaleString() + '+';
    return Math.floor(n);
  };

  const animateCounter = (el) => {
    const target = +el.dataset.target;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = format(current, target);
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
})();

// Feature section tab switching
document.querySelectorAll('.fb-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    // deactivate all tabs and panels
    document.querySelectorAll('.fb-tab').forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.fb-panel').forEach((p) => p.classList.remove('active'));

    // activate clicked
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.querySelector(`.fb-panel[data-panel="${target}"]`);
    if (panel) panel.classList.add('active');
  });
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // close all
    document.querySelectorAll('.faq-item').forEach((other) => {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// Domain search / transfer tabs with functional redirection to billing area
const domainInput = document.querySelector('.domain-box input');
if (domainInput) {
  const handleDomainAction = (actionType) => {
    const val = domainInput.value.trim();
    if (!val) return;
    let url;
    if (actionType === 'transfer') {
      url = `https://my.abayhost.com/cart.php?a=add&domain=transfer&query=${encodeURIComponent(val)}`;
    } else {
      url = `https://my.abayhost.com/cart.php?a=add&domain=register&query=${encodeURIComponent(val)}`;
    }
    window.open(url, '_blank');
  };

  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const activeTab = document.querySelector('.domain-box .tabs button.active');
      const action = activeTab && activeTab.textContent.toLowerCase().includes('transfer') ? 'transfer' : 'register';
      handleDomainAction(action);
    }
  });

  document.querySelectorAll('.domain-box .tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const alreadyActive = btn.classList.contains('active');
      document.querySelectorAll('.domain-box .tabs button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      
      const action = btn.textContent.toLowerCase().includes('transfer') ? 'transfer' : 'register';
      // Only execute if they clicked tab with input value filled
      if (domainInput.value.trim()) {
        handleDomainAction(action);
      }
    });
  });
}

// Close mobile menu when a link is tapped
document.querySelectorAll('.mobile-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

// Scroll to top button show/hide and click functionality
const scrollTopBtn = document.getElementById('scroll-top');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Transparent navbar — switch style after scrolling past hero
(function () {
  const header = document.getElementById('main-header');
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();

// 3D parallax tilt effect for hero cards stage
(function () {
  const stage = document.querySelector('.hero-3d-stage');
  const hero3d = document.querySelector('.hero-3d');
  if (!stage || !hero3d) return;

  const handleTilt = (e) => {
    const rect = hero3d.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate rotation angles (max 15 degrees)
    const rX = -(y / rect.height) * 25;
    const rY = (x / rect.width) * 25;
    
    stage.style.transform = `rotateX(${rX}deg) rotateY(${rY}deg)`;
  };

  const resetTilt = () => {
    stage.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  // Only apply tilt on desktop / hover screens
  if (window.matchMedia('(hover: hover)').matches) {
    hero3d.addEventListener('mousemove', handleTilt);
    hero3d.addEventListener('mouseleave', resetTilt);
  }
})();

// Support chat widget
(function () {
  const launcher = document.getElementById('chat-launcher');
  const panel = document.getElementById('chat-panel');
  const body = document.getElementById('chat-body');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const iconChat = document.getElementById('icon-chat');
  const iconClose = document.getElementById('icon-close');
  if (!launcher || !panel) return;

  let opened = false;
  let greeted = false;

  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function addMessage(text, from) {
    const div = document.createElement('div');
    div.className = 'msg ' + from;
    div.textContent = text;
    body.appendChild(div);
    scrollToBottom();
  }

  function addQuickReplies() {
    const wrap = document.createElement('div');
    wrap.className = 'quick-replies';
    const options = ['Pricing', 'Free migration', 'Domains', 'Talk to support'];
    options.forEach((label) => {
      const btn = document.createElement('button');
      btn.className = 'qr-btn';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        addMessage(label, 'user');
        wrap.remove();
        respond(label);
      });
      wrap.appendChild(btn);
    });
    body.appendChild(wrap);
    scrollToBottom();
  }

  function showTyping(callback) {
    const el = document.createElement('div');
    el.className = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    scrollToBottom();
    setTimeout(() => {
      el.remove();
      callback();
    }, 650);
  }

  function respond(intentOrText) {
    const text = intentOrText.toLowerCase();
    let reply;
    if (text.includes('pricing') || text.includes('price') || text.includes('cost')) {
      reply = 'Web Hosting starts at 4,700 ETB/year, Cloud VPS from 3,950 ETB/month, and Domains from 3,350 ETB/year. Want a link to the full plan comparison?';
    } else if (text.includes('migrat')) {
      reply = 'We offer free, no-downtime migration from any other host. Just share your current hosting details in a support ticket and our team handles the rest.';
    } else if (text.includes('domain')) {
      reply = 'You can search, register, or transfer a domain right from the box at the top of this page. Transfers include free WHOIS privacy.';
    } else if (text.includes('vps') || text.includes('server')) {
      reply = 'Cloud VPS starts at 3,950 ETB/month with NVMe storage and full root access. Windows VPS is also available from 8,950 ETB/month.';
    } else if (text.includes('support') || text.includes('help') || text.includes('talk')) {
      reply = 'Our team is online 24/7 via live chat, email (info@abayhost.com), or phone at +251 988 20 20 20.';
    } else if (text.includes('uptime') || text.includes('down')) {
      reply = 'We guarantee 99.9% uptime backed by redundant power, network links, and automated failover monitoring from our Addis Ababa datacenter.';
    } else if (text.includes('refund') || text.includes('guarantee')) {
      reply = 'Every plan is covered by a 30-day money-back guarantee — no hassle, no risk.';
    } else if (text.includes('hello') || text.includes('hi')) {
      reply = 'Hello! Good to hear from you. Ask me about pricing, migration, domains, or support.';
    } else if (text.includes('thank')) {
      reply = "You're welcome! Anything else I can help with?";
    } else {
      reply = "Thanks for reaching out! For anything specific, our support team is available 24/7 at info@abayhost.com or +251 988 20 20 20.";
    }
    showTyping(() => addMessage(reply, 'bot'));
  }

  function greet() {
    if (greeted) return;
    greeted = true;
    showTyping(() => {
      addMessage("Hi there! I'm the AbayHost assistant.", 'bot');
      setTimeout(() => {
        addMessage('What can I help you with today?', 'bot');
        addQuickReplies();
      }, 400);
    });
  }

  function openChat() {
    opened = true;
    panel.classList.add('open');
    launcher.setAttribute('aria-expanded', 'true');
    iconChat.style.display = 'none';
    iconClose.style.display = 'block';
    greet();
    setTimeout(() => input.focus(), 200);
  }
  function closeChat() {
    opened = false;
    panel.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
    iconChat.style.display = 'block';
    iconClose.style.display = 'none';
  }

  launcher.addEventListener('click', () => (opened ? closeChat() : openChat()));
  const closeBtn = document.getElementById('chat-close');
  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  function handleSend() {
    const val = input.value.trim();
    if (!val) return;
    addMessage(val, 'user');
    input.value = '';
    respond(val);
  }
  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
})();
