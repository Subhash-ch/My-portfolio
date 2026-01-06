document.addEventListener('DOMContentLoaded', () => {
    initYear();
    initTyping();
    initEducation();
    initScrollReveal();
    initSkills();
    initContactForm();
});

// --- 1. Year & Typing ---
function initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initTyping() {
    const words = ["Aspiring Software Developer", "Full-Stack Web Developer", "Problem Solver", "Open-Source Contributor"];
    const typedEl = document.getElementById('typed');
    if (typedEl) startTyping(typedEl, words, 120, 60, 900);
}

function startTyping(el, words, typeSpeed, deleteSpeed, pause) {
    let wIndex = 0, charIndex = 0, deleting = false;
    function tick() {
        const word = words[wIndex];
        if (!deleting) {
            el.textContent = word.slice(0, ++charIndex);
            if (charIndex === word.length) { deleting = true; setTimeout(tick, pause); return; }
            setTimeout(tick, typeSpeed);
        } else {
            el.textContent = word.slice(0, --charIndex);
            if (charIndex === 0) { deleting = false; wIndex = (wIndex + 1) % words.length; setTimeout(tick, 300); return; }
            setTimeout(tick, deleteSpeed);
        }
    }
    tick();
}

// --- 2. Education Section ---
function initEducation() {
    const eduEntries = document.querySelectorAll('.edu-entry');
    eduEntries.forEach(entry => {
        entry.addEventListener('click', () => toggleEdu(entry));
        entry.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEdu(entry); } });
    });
    function toggleEdu(entry) {
        const details = entry.querySelector('.edu-details');
        const expanded = entry.classList.toggle('expanded');
        entry.setAttribute('aria-expanded', expanded);
        if (!details) return;
        if (expanded) {
            details.style.maxHeight = details.scrollHeight + 20 + 'px';
            details.setAttribute('aria-hidden', 'false');
        } else {
            details.style.maxHeight = details.scrollHeight + 'px'; void details.offsetHeight;
            details.style.maxHeight = '0px';
            details.setAttribute('aria-hidden', 'true');
        }
    }
}

// --- 3. Scroll Reveal (Animation Logic) ---
function initScrollReveal() {
    
    const selectors = '.subcard, .edu-entry, .about-card, .edu-card, .projects-card, .skill-card';
    const elems = document.querySelectorAll(selectors);
    if (!elems.length) return;

    elems.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Stagger child elements if they exist
                const children = entry.target.querySelectorAll('.subcard, .reveal');
                if (children.length > 1) {
                    children.forEach((child, idx) => {
                        child.style.transitionDelay = `${idx * 80}ms`;
                        child.classList.add('in-view');
                    });
                }
                obs.unobserve(entry.target);
            }
        });
    }, {
        // Trigger when element is 50px inside viewport from bottom
        rootMargin: '0px 0px -50px 0px',
        threshold: 0
    });

    elems.forEach(el => observer.observe(el));
    const hero = document.querySelector('.hero-inner');
    if (hero) { hero.classList.add('reveal'); observer.observe(hero); }
}

// --- 4. Skills Section ---
function initSkills() {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.skill-card'));
    let lastFocused = null;

    function closeAll() {
        cards.forEach(c => {
            c.classList.remove('expanded');
            c.setAttribute('aria-expanded', 'false');
            const panel = c.querySelector('.skill-expanded');
            if (panel) panel.setAttribute('aria-hidden', 'true');
        });
        grid.classList.remove('dimmed');
        if (lastFocused) { try { lastFocused.focus(); } catch (e) { } lastFocused = null; }
    }

    function openCard(card) {
        closeAll();
        card.classList.add('expanded');
        card.setAttribute('aria-expanded', 'true');
        grid.classList.add('dimmed');
        const panel = card.querySelector('.skill-expanded');
        if (panel) panel.setAttribute('aria-hidden', 'false');
    }

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.skill-chip')) return;
            card.classList.contains('expanded') ? closeAll() : (lastFocused = document.activeElement, openCard(card));
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.contains('expanded') ? closeAll() : openCard(card); }
            else if (e.key === 'Escape') closeAll();
        });
    });
    document.addEventListener('click', (e) => { if (grid.classList.contains('dimmed') && !e.target.closest('.skill-card')) closeAll(); }, { capture: true });
    window.addEventListener('resize', () => { if (window.innerWidth < 520) closeAll(); });
}

// --- 5. Contact Form ---
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const fields = form.querySelectorAll('.float-field');

    fields.forEach(field => {
        const input = field.querySelector('input, textarea');
        if (!input) return;
        const sync = () => field.classList.toggle('filled', !!input.value.trim());
        sync();
        input.addEventListener('input', sync);
        input.addEventListener('focus', () => field.classList.add('focused'));
        input.addEventListener('blur', () => { field.classList.remove('focused'); validateField(field); });
    });

    const validators = {
        email: (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
        phone: (s) => /^[0-9]{7,15}$/.test(s.replace(/[\s()-]/g, '')),
        default: (s) => !!s
    };

    function setError(field, msg) {
        let err = field.querySelector('.field-error');
        if (!err) { err = document.createElement('div'); err.className = 'field-error'; field.appendChild(err); }
        err.textContent = msg; field.classList.add('has-error');
    }
    function clearError(field) {
        const err = field.querySelector('.field-error'); if (err) err.remove(); field.classList.remove('has-error');
    }
    function validateField(field) {
        const input = field.querySelector('input, textarea');
        if (!input) return true;
        const val = input.value.trim(); const id = input.id || '';
        clearError(field);
        if (!val) { setError(field, 'Required.'); return false; }
        if (id === 'email' && !validators.email(val)) { setError(field, 'Invalid email.'); return false; }
        if (id === 'phone' && !validators.phone(val)) { setError(field, 'Invalid phone.'); return false; }
        return true;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const valid = Array.from(fields).map(validateField).every(Boolean);
        if (!valid) { const first = form.querySelector('.has-error input, .has-error textarea'); if (first) first.focus(); return; }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Sent ✓';
        setTimeout(() => { btn.disabled = false; btn.textContent = 'Send'; form.reset(); fields.forEach(f => f.classList.remove('filled')); }, 1500);
    });
}