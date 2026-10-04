import { TRAILS } from './trails.js';
import { t, getLocale, localizeTrail, localizeDistrict, onLocaleChange } from './i18n.js';

const byId = id => document.getElementById(id);

// Render model text as text nodes. Only explicit HTTPS links become anchors.
function appendTextWithLinks(element, text) {
  text = text.replace(/^#{1,6}\s+/gm, '');
  const pattern = /\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)|(https:\/\/[^\s<>*]+)|\*\*([^*\n]+)\*\*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    element.append(document.createTextNode(text.slice(cursor, match.index)));
    if (match[4]) {
      const strong = document.createElement('strong'); strong.textContent = match[4]; element.append(strong);
    } else {
      const anchor = document.createElement('a');
      anchor.href = match[2] || match[3];
      anchor.textContent = match[1] || match[3];
      anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
      element.append(anchor);
    }
    cursor = match.index + match[0].length;
  }
  element.append(document.createTextNode(text.slice(cursor)));
}

export function initChat(getPageContext) {
  const sidebar = byId('chatSidebar');
  const log = byId('chatMessages');
  const input = byId('chatInput');
  const submit = byId('chatSend');
  const status = byId('chatStatus');
  let history = [];
  let selectedTrailId = null;
  let busy = false;

  function openChat(open = true) {
    sidebar.classList.toggle('is-open', open);
    byId('chatToggle').setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else byId('chatToggle').focus();
  }

  function selectTrail(id) {
    const trail = TRAILS.find(t => t.id === id);
    if (!trail) return;
    selectedTrailId = trail.id;
    renderContext();
    byId('chatUnselect').hidden = false;
    openChat();
  }

  function bubble(role, text, error = false) {
    const element = document.createElement('div');
    element.className = `chat-message ${role}${error ? ' error' : ''}`;
    appendTextWithLinks(element, text);
    log.append(element); log.scrollTop = log.scrollHeight;
    return element;
  }

  function translatedBubble(key, error = false) {
    const element = bubble('assistant', t(key), error);
    element.dataset.i18n = key;
    return element;
  }

  function setStatus(key) {
    status.dataset.i18n = key;
    status.textContent = t(key);
  }

  function renderContext() {
    const trail = TRAILS.find(trail => trail.id === selectedTrailId);
    const element = byId('chatContext');
    if (trail) {
      delete element.dataset.i18n;
      element.textContent = `${localizeTrail(trail).name} · ${trail.km} km · ${localizeDistrict(trail.district)}`;
    } else {
      element.dataset.i18n = 'noTrail';
      element.textContent = t('noTrail');
    }
  }

  function renderRecommendation(button) {
    const trail = TRAILS.find(trail => trail.id === button.dataset.chatTrail);
    button.querySelector('strong').textContent = localizeTrail(trail).name;
    button.querySelector('small').textContent = t('chatRecommendation', {
      district: localizeDistrict(trail.district), km: trail.km, minutes: button.dataset.minutes,
    });
  }

  function welcome() { translatedBubble('welcome'); }

  function setBusy(value) {
    busy = value;
    submit.disabled = value;
    input.disabled = value;
    byId('chatReset').disabled = value;
    byId('chatUnselect').disabled = value;
    log.setAttribute('aria-busy', String(value));
    document.querySelectorAll('[data-prompt], [data-chat-trail]').forEach(button => button.disabled = value);
    submit.dataset.i18n = value ? 'chatBusy' : 'chatSend';
    submit.textContent = t(submit.dataset.i18n);
  }

  byId('chatToggle').onclick = () => openChat(!sidebar.classList.contains('is-open'));
  byId('chatClose').onclick = () => openChat(false);
  sidebar.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sidebar.classList.contains('is-open')) openChat(false);
  });
  byId('chatUnselect').onclick = () => {
    selectedTrailId = null;
    renderContext();
    byId('chatUnselect').hidden = true;
  };
  byId('chatReset').onclick = () => {
    history = []; log.replaceChildren(); byId('chatUnselect').click(); welcome(); input.value = ''; input.focus();
  };
  document.addEventListener('click', event => {
    if (busy) return;
    const trailButton = event.target.closest('[data-chat-trail]');
    if (trailButton) selectTrail(trailButton.dataset.chatTrail);
    const promptButton = event.target.closest('[data-prompt]');
    if (promptButton) { input.value = promptButton.dataset.prompt; input.focus(); }
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault(); byId('chatForm').requestSubmit();
    }
  });

  byId('chatForm').addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    const messages = [...history.slice(-18), { role: 'user', content: text }];
    const pageContext = getPageContext();
    if (!pageContext) { setStatus('profileInvalid'); return; }
    const context = { ...pageContext, selectedTrailId };
    bubble('user', text); input.value = ''; setBusy(true);
    const waiting = translatedBubble('chatWaiting');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept-Language': getLocale() },
        body: JSON.stringify({ messages, context, locale: getLocale() }), signal: AbortSignal.timeout(65000),
      });
      const data = await response.json();
      if (!response.ok) throw Object.assign(new Error(data.error), { translationKey: data.code || 'chatUnavailable' });
      if (typeof data.reply !== 'string') throw Object.assign(new Error(), { translationKey: 'chatFormat' });
      waiting.remove();
      history = [...messages, { role: 'assistant', content: data.reply.slice(0, 3000) }];
      const answer = bubble('assistant', data.reply);
      for (const recommendation of data.recommendations || []) {
        if (!TRAILS.some(trail => trail.id === recommendation.id)) continue;
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'chat-route'; button.dataset.chatTrail = recommendation.id;
        const name = document.createElement('strong');
        const detail = document.createElement('small');
        button.dataset.minutes = recommendation.estimatedMinutes;
        button.append(name, detail); renderRecommendation(button); answer.append(button);
      }
      for (const source of data.sources || []) {
        answer.append(document.createTextNode('\n'));
        const sourceKey = {
          'https://www.nps.gov/grsm/planyourvisit/hikingsafety.htm': 'sourceSafety',
          'https://www.nps.gov/articles/10essentials.htm': 'sourceEssentials',
        }[source.url];
        const linkContainer = document.createElement('span');
        appendTextWithLinks(linkContainer, `[${sourceKey ? t(sourceKey) : source.title}](${source.url})`);
        if (sourceKey) linkContainer.querySelector('a').dataset.i18n = sourceKey;
        answer.append(linkContainer);
      }
      setStatus('chatFollowup');
      log.scrollTop = log.scrollHeight;
    } catch (error) {
      waiting.remove();
      const key = location.protocol === 'file:' ? 'chatFile'
        : error.name === 'TimeoutError' ? 'timeout'
        : error instanceof TypeError ? 'chatConnection' : error.translationKey || 'chatUnavailable';
      translatedBubble(key, true); input.value = text; setStatus('chatUndelivered');
    } finally { setBusy(false); input.focus(); }
  });

  onLocaleChange(() => {
    renderContext();
    log.querySelectorAll('.chat-route').forEach(renderRecommendation);
    setBusy(busy);
  });
  // Keep newly rendered trail cards disabled while an AI request is pending.
  const observer = new MutationObserver(() => {
    document.querySelectorAll('#list [data-chat-trail]').forEach(button => {
      if (button.disabled !== busy) button.disabled = busy;
    });
  });
  observer.observe(byId('list'), { childList: true });
  welcome();
  if (location.protocol === 'file:') {
    setStatus('chatFile');
  } else {
    fetch('/api/health').then(response => response.json()).then(data => {
      setStatus(data.chatConfigured ? 'chatReady' : 'chatUnconfigured');
    }).catch(() => { setStatus('chatConnection'); });
  }
}
