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

  /* Full-viewport rain (portaled into #chat-rain-root — sits under #root). */
  #chat-rain-root .chat-page-rain {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background:
      radial-gradient(ellipse 100% 85% at 50% -30%, rgba(120, 182, 245, 0.28), transparent 58%),
      radial-gradient(ellipse 80% 60% at 15% 110%, rgba(56, 189, 248, 0.14), transparent 50%),
      radial-gradient(ellipse 70% 50% at 90% 95%, rgba(45, 212, 191, 0.12), transparent 52%);
  }
  #chat-rain-root .chat-page-rain::before,
  #chat-rain-root .chat-page-rain::after {
    content: '';
    position: absolute;
    left: -15%;
    right: -15%;
    top: -35%;
    height: 170%;
    background: repeating-linear-gradient(
      99deg,
      transparent 0,
      transparent 7px,
      rgba(70, 130, 215, 0.35) 7px,
      rgba(70, 130, 215, 0.35) 8px,
      transparent 8px,
      transparent 28px
    );
    animation: chatRainStripe 12s linear infinite;
    will-change: transform;
    opacity: 1;
  }
  #chat-rain-root .chat-page-rain::after {
    opacity: 0.72;
    top: -45%;
    left: -20%;
    animation-duration: 18s;
    animation-direction: reverse;
    background: repeating-linear-gradient(
      102deg,
      transparent 0,
      transparent 12px,
      rgba(147, 205, 255, 0.32) 12px,
      rgba(147, 205, 255, 0.32) 13px,
      transparent 13px,
      transparent 40px
    );
  }
  @keyframes chatRainStripe {
    from { transform: translateY(-18%) translateX(0); }
    to { transform: translateY(28%) translateX(-64px); }
  }
  @media (prefers-reduced-motion: reduce) {
    #chat-rain-root .chat-page-rain::before,
    #chat-rain-root .chat-page-rain::after {
      animation: none;
    }
  }

  .chat-root {
    height: 100dvh;
    overflow: hidden;
    display: flex;
    position: relative;
    z-index: 1;
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
    background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,248,241,0.82));
    border: 1px solid rgba(255,255,255,0.65);
    border-right: none;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(18px);
    box-shadow: var(--chat-shadow);
    position: relative;
    z-index: 12;
    transition: transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s ease, border-color 0.25s ease;
    border-radius: 30px;
    overflow: hidden;
  }
  @media (hover: hover) and (min-width: 641px) {
    .sidebar:hover {
      box-shadow:
        var(--chat-shadow),
        0 0 0 1px rgba(255,122,89,0.08),
        0 32px 70px rgba(218, 119, 80, 0.12);
    }
  }

  .contact-row-btn {
    width: 100%;
    text-align: left;
    font: inherit;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.82rem 0.95rem;
    border-radius: 1.25rem;
    cursor: pointer;
    margin: 0;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.72);
    background: rgba(255,255,255,0.68);
    box-shadow: 0 10px 22px rgba(190, 153, 128, 0.08);
    transition:
      transform 0.22s cubic-bezier(.4,0,.2,1),
      box-shadow 0.22s ease,
      background 0.22s ease,
      border-color 0.22s ease;
  }
  .contact-row-btn:hover:not([data-active="true"]) {
    background: rgba(255,255,255,0.96);
    border-color: rgba(255,122,89,0.18);
    box-shadow: 0 14px 30px rgba(255,122,89, 0.1);
    transform: translateY(-2px);
  }
  .contact-row-btn:active:not([data-active="true"]) {
    transform: translateY(0);
  }
  .contact-row-btn:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(255,122,89, 0.25),
      0 14px 30px rgba(255,122,89, 0.1);
    border-color: rgba(255,122,89, 0.32);
  }
  .contact-row-btn[data-active="true"] {
    background: linear-gradient(135deg, rgba(255,122,89,0.16), rgba(255,186,120,0.22));
    border-color: rgba(255,122,89, 0.3);
    box-shadow: 0 16px 34px rgba(255,122,89, 0.16);
  }

  .sidebar-search-host input {
    cursor: text;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, transform 0.2s ease;
  }
  @media (hover: hover) {
    .sidebar-search-host:hover input:not(:focus) {
      border-color: rgba(255,122,89,0.22);
      background: rgba(255,255,255, 0.95);
    }
  }

  .sidebar-foot-btn {
    padding: 0.38rem 0.72rem !important;
    font-size: 0.69rem !important;
    border-radius: 0.55rem !important;
    border: 1px solid rgba(255,122,89, 0.16) !important;
    background: rgba(255,255,255, 0.35) !important;
    color: #334155 !important;
    cursor: pointer !important;
    font-family: inherit;
    font-weight: 700;
    transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, border-color 0.16s ease !important;
    box-shadow: 0 4px 12px rgba(180,120,88, 0.08);
  }
  .sidebar-foot-btn:hover:not(:disabled) {
    background: rgba(255,247,239, 0.95) !important;
    border-color: rgba(255,122,89, 0.32) !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(255,122,89, 0.12);
  }
  .sidebar-foot-btn:active:not(:disabled) { transform: translateY(0); }
  .sidebar-foot-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255,122,89, 0.2);
  }
  .sidebar-foot-btn:disabled { cursor: wait !important; opacity: 0.65; }

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
      z-index: 11;
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
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease;
    cursor: pointer;
  }
  @media (hover: hover) {
    .sidebar .sidebar-brand:hover .sidebar-brand-icon {
      transform: scale(1.08) rotate(-3deg);
      box-shadow: 0 18px 38px rgba(255,122,89,0.42);
    }
    .sidebar-brand-icon:active { transform: scale(0.96); }
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
    overflow-x: hidden;
    padding: 0.55rem 0.65rem 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.38rem;
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
    z-index: 2;
    opacity: 0;
    transform: translateX(16px);
    transition: opacity 0.45s .1s, transform 0.45s .1s;
    border-radius: 34px;
    overflow: hidden;
    background: rgba(255,255,255,0.58);
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

  .chat-typing-line {
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
    font-style: normal;
    font-weight: 700;
    color: #ff7a59;
    letter-spacing: 0.02em;
  }
  .chat-typing-dots {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    vertical-align: middle;
  }
  .chat-typing-dots span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ff7a59;
    animation: typingDotJump 1.15s infinite ease-in-out;
  }
  .chat-typing-dots span:nth-child(2) { animation-delay: 0.12s; }
  .chat-typing-dots span:nth-child(3) { animation-delay: 0.24s; }
  @keyframes typingDotJump {
    0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
    35% { opacity: 1; transform: translateY(-4px); }
  }

  .messages-area {
    position: relative;
    flex: 1;
    overflow-y: auto;
    padding: 1.35rem 1.15rem;
    display: flex;
    flex-direction: column;
    gap: 0.12rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,122,89,0.22) transparent;
    background:
      radial-gradient(circle at top, rgba(255,183,120,0.14), transparent 32%),
      linear-gradient(180deg, rgba(255,253,249,0.94), rgba(251,245,239,0.92));
    z-index: 2;
  }
  .messages-area::-webkit-scrollbar { width: 5px; }
  .messages-area::-webkit-scrollbar-thumb {
    background: rgba(255,122,89,0.24);
    border-radius: 99px;
  }

  .chat-scroll-jump {
    position: absolute;
    left: 50%;
    top: 50%;
    bottom: auto;
    right: auto;
    transform: translate(-50%, -50%);
    z-index: 8;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid rgba(255,122,89, 0.25);
    background: linear-gradient(135deg, rgba(255,255,255, 0.95), rgba(255,247,239, 0.98));
    color: var(--chat-accent);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 14px 32px rgba(255,122,89, 0.18),
      0 0 0 1px rgba(255,255,255, 0.8);
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
  }
  .chat-scroll-jump:hover {
    transform: translate(-50%, -50%) scale(1.08);
    box-shadow:
      0 18px 40px rgba(255,122,89, 0.24),
      0 0 0 1px rgba(255,255,255, 0.9);
  }
  .chat-scroll-jump:active {
    transform: translate(-50%, -50%) scale(0.92);
  }
  .chat-scroll-jump:focus-visible {
    outline: none;
    transform: translate(-50%, -50%) scale(1.03);
    box-shadow: 0 0 0 3px rgba(255,122,89, 0.28), 0 14px 32px rgba(255,122,89, 0.18);
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
    transition: transform 0.22s ease, opacity 0.22s ease, box-shadow 0.22s ease;
    cursor: default;
  }
  @media (hover: hover) {
    .sidebar .sidebar-brand:hover .conn-badge {
      transform: translateX(-2px);
      box-shadow: 0 10px 18px rgba(255,122,89, 0.08);
    }
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
