// set current year
document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Typing effect - words to cycle through.
    // Replace or extend this list with phrases directly from your resume if you want.
    const words = [
        "Aspiring Software Developer",
        "Full-Stack Web Developer",
        "Problem Solver",
        "Data Structures & Algorithms",
        "Open-Source Contributor"
    ];

    const typedEl = document.getElementById('typed');
    if (typedEl) startTyping(typedEl, words, 120, 60, 900);
});

/**
 * startTyping(element, words, typeSpeed, deleteSpeed, pause)
 * - element: DOM node where text will appear
 * - words: array of strings
 * - typeSpeed: ms per character typing
 * - deleteSpeed: ms per character deleting
 * - pause: ms pause after a word completes before deleting
 *
 * Simple, robust typing loop with no external libraries.
 */
function startTyping(el, words, typeSpeed = 120, deleteSpeed = 60, pause = 900) {
    let wIndex = 0, charIndex = 0, deleting = false;
    function tick() {
        const word = words[wIndex];
        if (!deleting) {
            el.textContent = word.slice(0, ++charIndex);
            if (charIndex === word.length) {
                deleting = true;
                setTimeout(tick, pause);
                return;
            }
            setTimeout(tick, typeSpeed);
        } else {
            el.textContent = word.slice(0, --charIndex);
            if (charIndex === 0) {
                deleting = false;
                wIndex = (wIndex + 1) % words.length;
                setTimeout(tick, 300);
                return;
            }
            setTimeout(tick, deleteSpeed);
        }
    }
    tick();
}


// Education expand/collapse behavior
document.addEventListener('DOMContentLoaded', () => {
    const eduEntries = document.querySelectorAll('.edu-entry');
    eduEntries.forEach(entry => {
        // click toggles
        entry.addEventListener('click', () => toggleEdu(entry));
        // keyboard accessibility: Enter / Space to toggle
        entry.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleEdu(entry);
            }
        });
    });

    function toggleEdu(entry) {
        const details = entry.querySelector('.edu-details');
        const expanded = entry.classList.toggle('expanded');
        entry.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (!details) return;

        if (expanded) {
            // set max-height to content height for transition
            details.style.maxHeight = details.scrollHeight + 20 + 'px';
            details.setAttribute('aria-hidden', 'false');
        } else {
            // collapse smoothly
            details.style.maxHeight = details.scrollHeight + 'px'; // ensure starting value
            // force reflow to enable transition
            void details.offsetHeight;
            details.style.maxHeight = '0px';
            details.setAttribute('aria-hidden', 'true');
        }
    }
});


// ---------------------- Scroll reveal (bottom -> top) ----------------------
// Observe cards and reveal them when they enter viewport.
// Targets: .subcard and .edu-entry (add more selectors if you want other card types)
(function setupScrollReveal() {
  // selectors of elements that should animate in
  const selectors = '.subcard, .edu-entry, .about-card, .edu-card, .project-card, .skill-card';
  const elems = Array.from(document.querySelectorAll(selectors));

  if (!elems.length) return;

  // Give each element initially the reveal class if not present
  elems.forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });

  // Intersection Observer options
  const ioOptions = {
    root: null,
    rootMargin: '0px 0px -12% 0px', // trigger slightly before fully in view
    threshold: 0
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // Add in-view class to play animation
        el.classList.add('in-view');

        // If element contains multiple child reveals (like .about-subcards), stagger them
        const children = el.querySelectorAll('.subcard, .reveal');
        if (children.length > 1) {
          children.forEach((child, idx) => {
            // only apply if they don't already have a custom delay
            child.style.transitionDelay = `${idx * 80}ms`;
            child.classList.add('in-view');
          });
        }

        // Stop observing once revealed (optional; keeps animations once visible)
        obs.unobserve(el);
      }
    });
  }, ioOptions);

  // Observe each element
  elems.forEach(el => observer.observe(el));

  // Also: reveal hero content on page load if visible
  const hero = document.querySelector('.hero-inner');
  if (hero) {
    if (!hero.classList.contains('reveal')) hero.classList.add('reveal');
    // ensure it's observed too (in case hero is in initial viewport)
    observer.observe(hero);
  }
})();

// Full JS for the Skills section (paste into script.js)
// Expects HTML structure:
// <div id="skillsGrid" class="skills-grid">
//   <article class="skill-card"> ... <div class="skill-expanded"> <div class="skill-pool"> <div class="skill-chip"> ... </div> ... </div></div></article>
//   ...
// </div>

(function SkillSectionModule() {
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.skill-card'));

  // Accessibility / ARIA initialization
  cards.forEach((c) => {
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', c.getAttribute('tabindex') || '0');
    c.setAttribute('aria-expanded', 'false');
    const panel = c.querySelector('.skill-expanded');
    if (panel) panel.setAttribute('aria-hidden', 'true');
  });

  function closeAll() {
    cards.forEach(c => {
      c.classList.remove('expanded');
      c.setAttribute('aria-expanded', 'false');
      const panel = c.querySelector('.skill-expanded');
      if (panel) {
        panel.setAttribute('aria-hidden', 'true');
        // remove per-chip stagger styles
        const chips = panel.querySelectorAll('.skill-chip');
        chips.forEach(ch => {
          ch.style.transitionDelay = '';
          ch.classList.remove('chip-in');
        });
      }
    });
    grid.classList.remove('dimmed');
    // return focus to previously focused card if stored
    if (SkillSectionModule._lastFocused) {
      try { SkillSectionModule._lastFocused.focus(); } catch(e){}
      SkillSectionModule._lastFocused = null;
    }
  }

  function openCard(card) {
    // close others first
    closeAll();
    card.classList.add('expanded');
    card.setAttribute('aria-expanded', 'true');
    const panel = card.querySelector('.skill-expanded');
    if (panel) panel.setAttribute('aria-hidden', 'false');

    // dim siblings visually
    grid.classList.add('dimmed');

    // animate chips with small stagger
    if (panel) {
      const chips = Array.from(panel.querySelectorAll('.skill-chip'));
      chips.forEach((chip, i) => {
        // stagger delay (ms)
        const delay = i * 70;
        chip.style.transitionDelay = `${delay}ms`;
        // ensure class that triggers any CSS in-view animations (if defined)
        // also use a tiny timeout to ensure the element is visible before adding class
        setTimeout(() => chip.classList.add('chip-in'), 20 + delay);
      });
    }
  }

  // Toggle/open/close handler for a card
  function toggleCard(card) {
    const isOpen = card.classList.contains('expanded');
    if (isOpen) {
      closeAll();
      return;
    }
    // store last focused for focus restore
    SkillSectionModule._lastFocused = document.activeElement;
    openCard(card);
  }

  // Click and keyboard handlers
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicking a chip inside the card, do not toggle the card.
      if (e.target.closest('.skill-chip')) return;
      toggleCard(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      } else if (e.key === 'Escape') {
        closeAll();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        // move focus to next card (wrap)
        const idx = cards.indexOf(card);
        const next = cards[(idx + 1) % cards.length];
        next.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const idx = cards.indexOf(card);
        const prev = cards[(idx - 1 + cards.length) % cards.length];
        prev.focus();
      }
    });
  });

  // Close when clicking outside any skill-card while a card is expanded
  document.addEventListener('click', (e) => {
    if (!grid.classList.contains('dimmed')) return;
    if (!e.target.closest('.skill-card')) closeAll();
  }, { capture: true });

  // Close on Escape globally
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // Optional: if user resizes and something weird happens, collapse
  window.addEventListener('resize', () => {
    // keep expanded state but ensure layout OK; collapse if viewport too small (optional)
    // remove this behavior if you prefer expanded to persist on resize
    if (window.innerWidth < 520) closeAll();
  });

  // Expose a tiny API (useful for debugging)
  window.SkillSection = {
    open: (indexOrSelector) => {
      if (!grid) return;
      let card;
      if (typeof indexOrSelector === 'number') card = cards[indexOrSelector];
      else card = grid.querySelector(indexOrSelector);
      if (card) openCard(card);
    },
    closeAll
  };
})();


// Contact form: floating labels + client-side validation (no AJAX, no sending)
(function setupContactFormValidation() {
  const fields = document.querySelectorAll('.float-field');

  // Floating label behavior (keep)
  fields.forEach(field => {
    const input = field.querySelector('input, textarea');
    if (!input) return;

    const sync = () => {
      if (input.value && input.value.trim() !== '') field.classList.add('filled');
      else field.classList.remove('filled');
    };
    sync();
    input.addEventListener('input', sync);
    input.addEventListener('focus', () => field.classList.add('focused'));
    input.addEventListener('blur', () => field.classList.remove('focused'));
  });

  // Validation helpers
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const isPhone = (s) => {
    const cleaned = s.replace(/[\s()-]/g, '');
    return /^[0-9]{7,15}$/.test(cleaned);
  };

  const form = document.getElementById('contactForm');
  if (!form) return;

  // remove existing error nodes helper
  function clearError(field) {
    const existing = field.querySelector('.field-error');
    if (existing) existing.remove();
    field.classList.remove('has-error');
  }
  function setError(field, message) {
    clearError(field);
    const err = document.createElement('div');
    err.className = 'field-error';
    err.textContent = message;
    field.appendChild(err);
    field.classList.add('has-error');
  }

  // Validate single field and return true/false
  function validateField(field) {
    const input = field.querySelector('input, textarea');
    if (!input) return true;
    const id = input.id || input.name || '';
    const val = (input.value || '').trim();

    clearError(field);

    if (id === 'firstName' || id === 'lastName') {
      if (!val) { setError(field, 'This field is required.'); return false; }
      if (val.length < 2) { setError(field, 'Name is too short.'); return false; }
      return true;
    }

    if (id === 'phone') {
      if (!val) { setError(field, 'Phone number is required.'); return false; }
      if (!isPhone(val)) { setError(field, 'Enter a valid phone number (digits only).'); return false; }
      return true;
    }

    if (id === 'email') {
      if (!val) { setError(field, 'Email is required.'); return false; }
      if (!isEmail(val)) { setError(field, 'Enter a valid email address.'); return false; }
      return true;
    }

    if (id === 'message') {
      if (!val) { setError(field, 'Message is required.'); return false; }
      if (val.length < 10) { setError(field, 'Message must be at least 10 characters.'); return false; }
      return true;
    }

    // default required check
    if (!val) { setError(field, 'This field is required.'); return false; }
    return true;
  }

  // Validate on blur for each field
  fields.forEach(field => {
    const input = field.querySelector('input, textarea');
    if (!input) return;
    input.addEventListener('blur', () => validateField(field));
  });

  // On submit: validate all, show errors. If all valid, show success toast and reset.
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear all previous errors
    fields.forEach(clearError);

    // Validate all fields and collect results
    const results = Array.from(fields).map(f => validateField(f));
    const valid = results.every(Boolean);

    if (!valid) {
      // focus first invalid field's input
      const firstInvalid = document.querySelector('.float-field.has-error input, .float-field.has-error textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // All valid — show simple success feedback (no network call)
    // Replace this with your own send logic later.
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sent ✓';
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send';
      }, 1400);
    }

    // Reset form and floating labels after a short delay
    setTimeout(() => {
      form.reset();
      fields.forEach(f => f.classList.remove('filled'));
    }, 450);
  });
})();
