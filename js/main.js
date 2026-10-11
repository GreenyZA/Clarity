// Clarity — goclarity.co.za
// Main JS: Scroll handling, form, year, interactions.

document.addEventListener('DOMContentLoaded', () => {

    // ---- Year in footer ----
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = 70;
                const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---- Discovery Call form (real submission + UX) ----
    const form = document.getElementById('discoveryForm');
    if (form) {
        const feedback = document.getElementById('formFeedback');
        const submitBtn = document.getElementById('submitBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const pillar = form.pillar.value;
            const message = form.message.value.trim();

            if (!name || name.length < 2) {
                showFeedback('Please enter your name.', 'error');
                return;
            }
            if (!email || !isValidEmail(email)) {
                showFeedback('Please enter a valid email address.', 'error');
                return;
            }
            if (!pillar) {
                showFeedback('Please select which pillar interests you.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            showFeedback('Sending your request...', 'info');

            const payload = { name, email, pillar, message, source: 'goclarity.co.za', timestamp: new Date().toISOString() };

            try {
                const res = await fetch(form.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    window.location.href = '/contact-success.html';
                } else {
                    throw new Error('Server responded with ' + res.status);
                }
            } catch (err) {
                console.warn('[Clarity] API unavailable, falling back to mailto:', err);
                const subject = encodeURIComponent('Discovery Call Request — ' + name);
                const body = encodeURIComponent(
                    'New Discovery Call Request\n\n' +
                    'Name: ' + name + '\n' +
                    'Email: ' + email + '\n' +
                    'Pillar: ' + pillar + '\n' +
                    'Message: ' + (message || 'None') + '\n\n' +
                    'Submitted: ' + new Date().toLocaleString()
                );
                window.location.href = 'mailto:hello@goclarity.co.za?subject=' + subject + '&body=' + body;
                showFeedback('Opening your email client. If it doesn\'t open, email us directly.', 'info');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Request Discovery Call';
            }
        });

        function showFeedback(text, type) {
            feedback.textContent = text;
            feedback.className = 'form-feedback form-feedback--' + type;
            feedback.style.display = 'block';
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});
