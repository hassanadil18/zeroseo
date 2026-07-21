(() => {
  const formatDate = (date) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
  const blogImage = (image) => image?.replace('../../assets/', '../../assets/');

  function initMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav-links');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '×' : '☰';
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
  }

  function renderBlogList() {
    const grid = document.querySelector('#blogGrid');
    if (!grid || !Array.isArray(window.blogPosts)) return;
    grid.innerHTML = [...window.blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date)).map((post) => `
      <article class="article-card"><img src="${blogImage(post.image)}" width="800" height="485" loading="lazy" alt=""><div class="article-card-content"><span class="tag">${post.category}</span><h3>${post.title}</h3><p>${post.excerpt}</p><div class="meta"><span>${formatDate(post.date)}</span><span>${post.author}</span></div><p><a class="text-link" href="blog-single.html?post=${encodeURIComponent(post.id)}">Read insight</a></p></div></article>`).join('');
  }

  function renderBlogPost() {
    const title = document.querySelector('#postTitle');
    if (!title || !Array.isArray(window.blogPosts)) return;
    const id = new URLSearchParams(window.location.search).get('post');
    const post = window.blogPosts.find((item) => String(item.id) === id) || window.blogPosts[0];
    document.title = `${post.title} — ZeroSEO`;
    title.textContent = post.title;
    document.querySelector('#postCategory').textContent = post.category;
    document.querySelector('#postMeta').innerHTML = `<span>${formatDate(post.date)}</span><span>${post.author}</span>`;
    const image = document.querySelector('#postImage');
    image.src = blogImage(post.image);
    image.alt = post.title;
    document.querySelector('#postContent').innerHTML = post.content;
    const recent = document.querySelector('#recentPosts');
    recent.innerHTML = window.blogPosts.filter((item) => item.id !== post.id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4).map((item) => `<li><a href="blog-single.html?post=${item.id}">${item.title}</a></li>`).join('');
  }

  function initCalendly() {
    const triggers = document.querySelectorAll('[data-calendly]');
    if (!triggers.length) return;
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        const url = trigger.getAttribute('data-calendly');
        if (!url) return;
        event.preventDefault();
        const popup = window.open(url, '_blank', 'noopener,noreferrer,width=900,height=700');
        if (!popup) {
          window.location.href = url;
        }
      });
    });
  }

  function initHeroChat() {
    const chat = document.querySelector('.hero-chat');
    if (!chat) return;

    const sequence = [
      { type: 'user', text: 'We miss bookings when calls come after hours.' },
      { type: 'bot', typing: true },
      { type: 'bot', text: 'We build appointment systems with instant online booking and smart intake forms.' },
      { type: 'user', text: 'Can it send reminders and reduce no-shows?' },
      { type: 'bot', typing: true },
      { type: 'bot', text: 'Yes. We automate confirmations, WhatsApp/SMS reminders, and follow-ups to fill more slots.' }
    ];

    let index = 0;
    let typingBubble = null;

    const addMessage = () => {
      if (index >= sequence.length) return;
      const item = sequence[index];
      index += 1;

      if (item.typing) {
        if (typingBubble) typingBubble.remove();
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble chat-bubble-assistant typing';
        bubble.setAttribute('aria-label', 'Assistant is typing');
        bubble.innerHTML = '<span></span><span></span><span></span>';
        chat.appendChild(bubble);
        typingBubble = bubble;
        window.setTimeout(addMessage, 850);
        return;
      }

      if (typingBubble) {
        typingBubble.remove();
        typingBubble = null;
      }

      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${item.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`;
      bubble.textContent = item.text;
      chat.appendChild(bubble);
      window.setTimeout(addMessage, item.type === 'user' ? 700 : 1050);
    };

    window.setTimeout(addMessage, 500);
  }

  function initContactForm() {
    const form = document.querySelector('#contactForm');
    if (!form) return;
    const status = document.querySelector('#formStatus');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        status.className = 'form-status error';
        status.textContent = 'Please complete the required fields before sending your inquiry.';
        form.reportValidity();
        return;
      }
      const name = form.querySelector('#name').value.trim();
      const email = form.querySelector('#email').value.trim();
      const subject = form.querySelector('#subject').value;
      const message = form.querySelector('#message').value.trim();
      const company = form.querySelector('#company').value.trim();
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = 'Sending inquiry…';
      try {
        await sendInquiry({ name, email, company, subject, message });
        form.reset();
        status.className = 'form-status success';
        status.textContent = 'Thank you—your inquiry has been sent. We’ll be in touch soon.';
      } catch (error) {
        const body = `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'Not provided'}\nInterest: ${subject}\n\n${message}`;
        window.location.href = `mailto:zero.seo.zs.10@gmail.com?subject=${encodeURIComponent(`Website inquiry: ${subject}`)}&body=${encodeURIComponent(body)}`;
        status.className = 'form-status success';
        status.textContent = 'Your email app is opening with your inquiry prepared. If it does not open, email us directly at zero.seo.zs.10@gmail.com.';
      } finally {
        button.disabled = false;
        button.textContent = 'Send inquiry →';
      }
    });
  }

  async function sendInquiry(data) {
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    window.emailjs.init({ publicKey: 'ZmHWrknXIJ28Mt4DK' });
    return window.emailjs.send('service_c1rfvuj', 'template_7yfmbg9', {
      from_name: data.name, reply_to: data.email, user_email: data.email,
      company: data.company || 'Not provided', subject: data.subject,
      message: data.message, to_email: 'zero.seo.zs.10@gmail.com'
    });
  }

  document.addEventListener('DOMContentLoaded', () => { initMenu(); renderBlogList(); renderBlogPost(); initCalendly(); initHeroChat(); initContactForm(); });
})();
