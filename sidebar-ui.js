export function initSidebars() {
  const byId = id => document.getElementById(id);
  const layout = byId('appLayout');
  const desktop = matchMedia('(min-width: 1181px)');
  let profileOpen = true;
  let desktopChatOpen = true;
  let mobileChatOpen = false;
  try {
    const saved = JSON.parse(localStorage.getItem('ttf-sidebars') || '{}');
    if (typeof saved.profileOpen === 'boolean') profileOpen = saved.profileOpen;
    if (typeof saved.chatOpen === 'boolean') desktopChatOpen = saved.chatOpen;
  } catch { /* Panels still work without browser storage. */ }

  const isChatOpen = () => desktop.matches ? desktopChatOpen : mobileChatOpen;

  function render() {
    const chatOpen = isChatOpen();
    layout.classList.toggle('profile-collapsed', !profileOpen);
    layout.classList.toggle('chat-collapsed', !chatOpen);
    byId('profileSidebar').hidden = !profileOpen;
    byId('profileExpand').hidden = profileOpen;
    byId('chatSidebar').hidden = !chatOpen;
    byId('chatExpand').hidden = chatOpen;
    for (const id of ['profileExpand', 'profileCollapse']) {
      byId(id).setAttribute('aria-expanded', String(profileOpen));
    }
    for (const id of ['chatExpand', 'chatClose', 'chatToggle']) {
      byId(id).setAttribute('aria-expanded', String(chatOpen));
    }
  }

  function save() {
    try {
      localStorage.setItem('ttf-sidebars', JSON.stringify({ profileOpen, chatOpen: desktopChatOpen }));
    } catch { /* Keep the current state even if storage is unavailable. */ }
  }

  function openProfile(open = true) {
    profileOpen = open;
    render(); save();
    byId(open ? 'profileCollapse' : 'profileExpand').focus();
  }

  function openChat(open = true) {
    if (desktop.matches) desktopChatOpen = open;
    else mobileChatOpen = open;
    render(); save();
    byId(open ? 'chatInput' : desktop.matches ? 'chatExpand' : 'chatToggle').focus();
  }

  byId('profileExpand').onclick = () => openProfile();
  byId('profileCollapse').onclick = () => openProfile(false);
  byId('chatExpand').onclick = () => openChat();
  byId('chatClose').onclick = () => openChat(false);
  byId('chatToggle').onclick = () => openChat(!isChatOpen());
  byId('chatSidebar').addEventListener('keydown', event => {
    if (event.key === 'Escape' && isChatOpen()) {
      event.preventDefault(); openChat(false);
    }
  });
  desktop.addEventListener('change', () => {
    const active = document.activeElement;
    render();
    // Keep keyboard focus usable if resizing hides the focused panel/control.
    if (byId('chatSidebar').contains(active) && !isChatOpen()) byId('chatToggle').focus();
    else if (active === byId('chatExpand') && !desktop.matches) byId('chatToggle').focus();
    else if (active === byId('chatToggle') && desktop.matches) {
      byId(isChatOpen() ? 'chatClose' : 'chatExpand').focus();
    }
  });
  render();
  return { openProfile, openChat };
}
