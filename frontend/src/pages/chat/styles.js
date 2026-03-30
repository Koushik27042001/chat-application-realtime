export const chatPageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=Manrope:wght@400;500;600;700&display=swap');
  :root {
    --chat-bg: #f6f1ea;
    --chat-paper: rgba(255,255,255,0.88);
    --chat-paper-strong: #ffffff;
    --chat-line: rgba(148, 163, 184, 0.22);
    --chat-text: #1f2937;
    --chat-sub: #6b7280;
    --chat-muted: #94a3b8;
    --chat-accent: #ff7a59;
    --chat-accent-2: #ffb347;
    --chat-cool: #1fb6a6;
    --chat-shadow: 0 24px 60px rgba(218, 119, 80, 0.14);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background:
      radial-gradient(circle at top left, rgba(255, 183, 120, 0.42), transparent 34%),
      radial-gradient(circle at top right, rgba(79, 209, 197, 0.22), transparent 28%),
      linear-gradient(180deg, #fffaf4 0%, #f5efe8 46%, #f8f3ee 100%);
    color: var(--chat-text);
    font-family: 'Manrope', sans-serif;
  }

  .chat-root {
    height: 100dvh;
    overflow: hidden;
    display: flex;
    position: relative;
    padding: 18px;
    gap: 18px;
  }
  .chat-root::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image:
      linear-gradient(rgba(255,122,89,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(31,182,166,0.05) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: linear-gradient(180deg, rgba(0,0,0,0.55), transparent 92%);
  }

  .sidebar {
    width: 320px;
    flex-shrink: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,248,241,0.92));
    border: 1px solid rgba(255,255,255,0.65);
    border-right: none;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(18px);
    box-shadow: var(--chat-shadow);
    position: relative;
    z-index: 10;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1);
    border-radius: 30px;
    overflow: hidden;
  }
  @media (max-width: 640px) {
    .chat-root { padding: 12px; }
    .sidebar {
      position: fixed;
      inset-y: 12px;
      left: 12px;
      transform: translateX(calc(-100% - 18px));
      width: min(88vw, 320px);
      box-shadow: 0 24px 70px rgba(135, 91, 64, 0.24);
    }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(87, 58, 40, 0.16);
      z-index: 9;
      backdrop-filter: blur(6px);
    }
  }

  .sidebar-header {
    padding: 1.25rem 1rem 0.7rem;
    border-bottom: 1px solid rgba(255,122,89,0.08);
    background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.12));
  }
  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0 0.15rem;
    margin-bottom: 0.9rem;
  }
  .sidebar-brand-icon {
    width: 38px;
    height: 38px;
    border-radius: 1rem;
    background: linear-gradient(135deg, var(--chat-accent), var(--chat-accent-2));
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 14px 26px rgba(255,122,89,0.3);
  }
  .sidebar-brand-name {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.08rem;
    color: #18212f;
    letter-spacing: -0.02em;
  }
  .sidebar-brand-name span { color: var(--chat-accent); }

  .contact-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.65rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,122,89,0.35) transparent;
  }
  .contact-list::-webkit-scrollbar { width: 5px; }
  .contact-list::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(255,122,89,0.5), rgba(31,182,166,0.35));
    border-radius: 99px;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
    z-index: 1;
    opacity: 0;
    transform: translateX(16px);
    transition: opacity 0.45s .1s, transform 0.45s .1s;
    border-radius: 34px;
    overflow: hidden;
    background: rgba(255,255,255,0.68);
    border: 1px solid rgba(255,255,255,0.72);
    box-shadow: 0 28px 80px rgba(148, 99, 63, 0.14);
    backdrop-filter: blur(20px);
  }
  .main.show { opacity: 1; transform: none; }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.4rem;
    background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,252,247,0.74));
    border-bottom: 1px solid rgba(255,122,89,0.1);
    backdrop-filter: blur(18px);
    flex-shrink: 0;
  }
  .topbar-left { display: flex; align-items: center; gap: 0.85rem; }
  .mobile-menu-btn {
    display: none;
    width: 38px;
    height: 38px;
    border-radius: 0.95rem;
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(255,122,89,0.14);
    cursor: pointer;
    align-items: center;
    justify-content: center;
    color: #7c5b47;
    box-shadow: 0 10px 20px rgba(225, 127, 81, 0.12);
    transition: transform 0.16s, background 0.16s;
  }
  .mobile-menu-btn:hover { transform: translateY(-1px); background: #fff; }
  @media (max-width: 640px) { .mobile-menu-btn { display: flex; } }

  .user-info-badge {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }
  .status-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 6px rgba(16,185,129,0.12);
    animation: statusPulse 3s infinite;
  }
  @keyframes statusPulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.72; transform: scale(0.92); }
  }
  .user-name-label {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.92rem;
    color: #18212f;
  }
  .user-sub { font-size: 0.74rem; color: #8b97a8; }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 0.95rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(255,122,89,0.16);
    color: #8c664e;
    font-size: 0.79rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
    font-family: 'Manrope', sans-serif;
    box-shadow: 0 10px 24px rgba(225, 127, 81, 0.12);
  }
  .logout-btn:hover {
    background: #fff4ef;
    border-color: rgba(255,122,89,0.28);
    color: #dc5f3a;
    transform: translateY(-1px);
  }

  .chat-header-bar {
    display: flex;
    align-items: center;
    gap: 0.95rem;
    padding: 1rem 1.35rem;
    background: linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,248,241,0.58));
    border-bottom: 1px solid rgba(255,122,89,0.1);
    backdrop-filter: blur(16px);
    flex-shrink: 0;
  }
  .chat-contact-name {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #1b2432;
    letter-spacing: -0.02em;
  }
  .chat-contact-status {
    font-size: 0.74rem;
    color: #8a97a8;
    margin-top: 0.12rem;
  }
  .chat-contact-status.online { color: #0f9f7d; }

  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.35rem 1.15rem;
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,122,89,0.22) transparent;
    background:
      radial-gradient(circle at top, rgba(255,183,120,0.18), transparent 32%),
      linear-gradient(180deg, rgba(255,253,249,0.98), rgba(251,245,239,0.96));
  }
  .messages-area::-webkit-scrollbar { width: 5px; }
  .messages-area::-webkit-scrollbar-thumb {
    background: rgba(255,122,89,0.24);
    border-radius: 99px;
  }

  .date-sep {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.9rem 0;
    font-size: 0.68rem;
    color: #b08a70;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
  }
  .date-sep::before, .date-sep::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,122,89,0.22), transparent);
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: #7f8a98;
    background:
      radial-gradient(circle at center, rgba(255,183,120,0.12), transparent 40%);
  }
  .empty-icon {
    width: 78px;
    height: 78px;
    border-radius: 1.6rem;
    background: linear-gradient(135deg, rgba(255,122,89,0.14), rgba(31,182,166,0.14));
    border: 1px solid rgba(255,255,255,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    box-shadow: 0 18px 36px rgba(225, 127, 81, 0.14);
    animation: float 4s ease-in-out infinite;
  }
  @keyframes float {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .empty-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.12rem;
    color: #304055;
  }
  .empty-sub { font-size: 0.84rem; color: #8b97a8; }

  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(8px) scale(0.97); }
    to { opacity: 1; transform: none; }
  }

  .section-label {
    padding: 0.55rem 1rem 0.3rem;
    font-size: 0.64rem;
    color: #b28d77;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .conn-badge {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.72rem;
    color: #8b97a8;
    margin-left: auto;
    padding: 0.32rem 0.55rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(255,122,89,0.12);
  }
  .conn-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .conn-dot.on { background: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.12); }
  .conn-dot.off { background: #f97316; box-shadow: 0 0 0 4px rgba(249,115,22,0.12); }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid rgba(255,122,89,0.08);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    background: linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,250,245,0.82));
  }
  .sidebar-footer-name {
    font-size: 0.86rem;
    font-weight: 700;
    color: #2b3647;
    font-family: 'Syne', sans-serif;
  }
  .sidebar-footer-email { font-size: 0.7rem; color: #8b97a8; }
  .sidebar-footer-actions {
    margin-left: auto;
    display: flex;
    gap: 0.45rem;
    width: 100%;
    justify-content: flex-end;
  }

  .reveal { opacity: 0; transform: translateY(12px); transition: opacity 0.4s, transform 0.4s; }
  .reveal.show { opacity: 1; transform: none; }
  .d1 { transition-delay: 0.08s; }
  .d2 { transition-delay: 0.16s; }
  .d3 { transition-delay: 0.24s; }
`;
