/* "Be the first to know" sign-up popup.
   Buttons: <button class="notify-open" data-notify="acp|banking3">…</button>
   Until NOTIFY_ENDPOINT is set (a Formspree or MailerLite form URL), the
   popup opens the visitor's email app with a short request to uxrafi@hotmail.com. */
(() => {
  const NOTIFY_ENDPOINT = '';
  const TO = 'uxrafi@hotmail.com';
  const BOOKS = {
    acp: {
      title: 'Be the first to know',
      text: 'Leave your email and I’ll let you know when <em>A Children’s Playground</em> is published.',
      book: 'A Children’s Playground',
      boxes: [['novel', 'My novels', true], ['tech', 'My books on banking and technology', false]]
    },
    blog: {
      title: 'Be the first to know',
      text: 'Leave your email and I’ll let you know when the first posts are published.',
      book: 'the blog',
      boxes: [['blog', 'New blog posts', true], ['novel', 'My novels', false], ['tech', 'My books on banking and technology', false]]
    },
    banking3: {
      title: 'Be the first to know',
      text: 'Leave your email and I’ll let you know when <em>Banking 3.0</em> is published in December 2026.',
      book: 'Banking 3.0',
      boxes: [['tech', 'My books on banking and technology', true], ['talks', 'Talks and briefings on Banking 3.0', false], ['novel', 'My novels', false]]
    }
  };
  const openers = document.querySelectorAll('.notify-open');
  if (!openers.length) return;
  document.documentElement.classList.add('notify-ready');

  const css = `
html:not(.notify-ready) .notify-open{display:none!important}
.notify-open{display:inline-flex;align-items:center;gap:.35rem;padding:.55rem .9rem;border:1px solid #c5d3dc;border-radius:4px;background:transparent;color:#3f6276;font:300 .85rem/1.2 Lato,Arial,sans-serif;cursor:pointer;white-space:nowrap;transition:background .2s,border-color .2s,color .2s}
.notify-open:hover,.notify-open:focus-visible{background:#e3edf2;border-color:#8fa9b8;color:#244f6c}
.notify-open:focus-visible{outline:2px solid #244f6c;outline-offset:2px}
.notify-dialog{box-sizing:border-box;width:min(460px,92vw);max-height:88svh;overflow-y:auto;margin:auto;padding:2rem 2rem 1.6rem;border:1px solid #adc1cc;border-radius:8px;background:#f7fafb;color:#1f2a33;box-shadow:0 20px 80px rgb(18 43 59 / .35)}
.notify-dialog::backdrop{background:rgb(18 35 47 / .55)}
.notify-dialog h2{margin:0 2rem .5rem 0;font:400 1.9rem/1.15 "Cormorant Garamond",Georgia,serif;color:#185b78}
.notify-dialog p{margin:0 0 1.1rem;font:300 .95rem/1.6 Lato,Arial,sans-serif;color:#2b3640}
.notify-close{position:absolute;right:.7rem;top:.55rem;width:2.2rem;height:2.2rem;border:0;border-radius:50%;background:transparent;color:#24556e;font:300 1.6rem/1 Lato,Arial,sans-serif;cursor:pointer}
.notify-close:hover,.notify-close:focus-visible{background:#dbe7ed}
.notify-dialog label.notify-email span{display:block;margin-bottom:.35rem;font:400 .68rem/1.3 Lato,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5a6f7f}
.notify-dialog input[type=email]{box-sizing:border-box;width:100%;padding:.6rem .7rem;border:1px solid #c5d3dc;border-radius:4px;background:#fff;font:300 1rem/1.3 Lato,Arial,sans-serif;color:#1f2a33}
.notify-dialog input[type=email]:focus{outline:2px solid #8fa9b8;outline-offset:1px}
.notify-dialog fieldset{margin:1.1rem 0 0;padding:0;border:0}
.notify-dialog legend{margin-bottom:.45rem;font:400 .68rem/1.3 Lato,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5a6f7f}
.notify-dialog fieldset label{display:flex;align-items:center;gap:.55rem;margin:.3rem 0;font:300 .92rem/1.4 Lato,Arial,sans-serif;color:#2b3640;cursor:pointer}
.notify-dialog input[type=checkbox]{width:1rem;height:1rem;accent-color:#244f6c}
.notify-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}
.notify-actions{display:flex;align-items:center;gap:1rem;margin-top:1.4rem}
.notify-submit{padding:.65rem 1.2rem;border:1px solid #244f6c;border-radius:4px;background:#244f6c;color:#fff;font:400 .88rem/1.2 Lato,Arial,sans-serif;cursor:pointer}
.notify-submit:hover,.notify-submit:focus-visible{background:#173c50}
.notify-submit[disabled]{opacity:.7;cursor:default}
.notify-privacy{margin:1rem 0 0!important;font-size:.78rem!important;color:#56697a!important}
.notify-status{margin:1rem 0 0!important;padding:.6rem .8rem;border-radius:4px;font-size:.9rem!important}
.notify-status.is-ok{background:#e3edf2;color:#173c50!important;border:1px solid #b9ccd6}
.notify-status.is-error{background:#f8ece9;color:#7b1724!important;border:1px solid #e3c2bb}
@media (max-width:520px){.notify-dialog{padding:1.7rem 1.2rem 1.3rem}}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const dlg = document.createElement('dialog');
  dlg.className = 'notify-dialog';
  dlg.setAttribute('aria-labelledby', 'notify-title');
  dlg.innerHTML = `<button type="button" class="notify-close" aria-label="Close">×</button>
<h2 id="notify-title"></h2><p class="notify-text"></p>
<form class="notify-form" novalidate>
<label class="notify-email"><span>Your email</span><input type="email" name="email" autocomplete="email" required maxlength="254"></label>
<input class="notify-hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
<fieldset><legend>Keep me posted about</legend><div class="notify-boxes"></div></fieldset>
<div class="notify-actions"><button type="submit" class="notify-submit">Notify me</button></div>
<p class="notify-privacy">Only book news, never shared. You can ask to be removed at any time.</p>
<p class="notify-status" role="status" aria-live="polite" hidden></p>
</form>`;
  document.body.appendChild(dlg);

  const form = dlg.querySelector('form'), email = form.elements.email, status = dlg.querySelector('.notify-status'),
    submit = dlg.querySelector('.notify-submit'), boxes = dlg.querySelector('.notify-boxes');
  let current = null, opener = null;

  function say(msg, ok) { status.hidden = false; status.className = 'notify-status ' + (ok ? 'is-ok' : 'is-error'); status.textContent = msg; }

  function open(key, btn) {
    const b = BOOKS[key]; if (!b) return;
    current = key; opener = btn;
    dlg.querySelector('#notify-title').textContent = b.title;
    dlg.querySelector('.notify-text').innerHTML = b.text;
    boxes.innerHTML = b.boxes.map(([v, label, on]) => `<label><input type="checkbox" name="interest" value="${v}"${on ? ' checked' : ''}> ${label}</label>`).join('');
    form.reset(); b.boxes.forEach(([v, , on]) => { const c = boxes.querySelector(`[value="${v}"]`); if (c) c.checked = on; });
    status.hidden = true; submit.disabled = false; submit.textContent = 'Notify me';
    if (btn) btn.setAttribute('aria-expanded', 'true');
    dlg.showModal(); email.focus();
  }

  openers.forEach(btn => {
    btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => open(btn.dataset.notify, btn));
  });
  dlg.querySelector('.notify-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => {
    if (e.target !== dlg) return;
    const r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });
  dlg.addEventListener('close', () => {
    if (opener) { opener.setAttribute('aria-expanded', 'false'); opener.focus({ preventScroll: true }); opener.blur(); }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!email.value || !email.checkValidity()) { say('Please enter a valid email address.', false); email.focus(); return; }
    const b = BOOKS[current];
    const interests = [...form.querySelectorAll('[name=interest]:checked')].map(c => c.parentElement.textContent.trim());
    if (!interests.length) { say('Please tick at least one option.', false); return; }
    if (!NOTIFY_ENDPOINT) {
      const body = `Please let me know when ${b.book === 'the blog' ? 'new posts are' : b.book + ' is'} published.\n\nKeep me posted about:\n- ${interests.join('\n- ')}\n\nMy email: ${email.value}`;
      location.href = `mailto:${TO}?subject=${encodeURIComponent('Notify me: ' + b.book)}&body=${encodeURIComponent(body)}`;
      say('Your email app should open with a short note ready to send. Thank you.', true);
      return;
    }
    submit.disabled = true; submit.textContent = 'Sending…'; status.hidden = true;
    try {
      const r = await fetch(NOTIFY_ENDPOINT, {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, book: b.book, interests: interests.join(', '), _subject: 'Notify me: ' + b.book, _gotcha: form.elements._gotcha.value })
      });
      if (!r.ok) throw new Error(r.status);
      submit.textContent = 'Done';
      say('Thank you. You’ll be among the first to hear.', true);
    } catch (err) {
      submit.disabled = false; submit.textContent = 'Notify me';
      say('Sorry, that didn’t go through. Please try again in a moment.', false);
    }
  });
})();
