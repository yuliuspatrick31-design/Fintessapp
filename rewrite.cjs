const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf-8');

// 1. Update variables
css = css.replace(/:root\s*\{[^}]+\}/m, `:root {
  --bg: #0A0A0A;
  --bg-card: #141414;
  --bg-card-hover: #1A1A1A;
  --bg-surface: #1F1F1F;
  --border: rgba(255,255,255,0.06);
  --border-strong: rgba(255,255,255,0.12);
  --accent: #AAFF00;
  --accent-run: #FFFFFF;
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255,255,255,0.6);
  --text-muted: rgba(255,255,255,0.35);
  --text: #FFFFFF;
  --text-dim: rgba(255,255,255,0.35);
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;
  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --blur: blur(20px);
  --blur-sm: blur(12px);
  --sidebar-w: 210px;
  --nav-h: 60px;
  --transition: 0.2s ease;
}`);

// 2. Body background & text
css = css.replace(/body\s*\{[\s\S]*?\}/m, `body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  min-height: 100dvh;
}`);

// 3. Page Headers
css = css.replace(/\.page-header h2\s*\{[^}]+\}/g, '.page-header h2 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }');
css = css.replace(/\.page-header p\s*\{[^}]+\}/g, '.page-header p { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }');
css = css.replace(/\.section-title\s*\{[^}]+\}/g, '.section-title { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }');
css = css.replace(/\.card-title\s*\{[^}]+\}/g, '.card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.4); }');

// 4. Cards
css = css.replace(/\.card\s*\{[\s\S]*?\}/, `.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  box-shadow: none;
  transition: background var(--transition);
}
.card:hover { background: var(--bg-card-hover); }`);

// 5. Stat Blocks
css = css.replace(/\.stat-grid\s*\{[\s\S]*?\}/, `.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}`);
css = css.replace(/\.stat-block\s*\{[\s\S]*?\}/, `.stat-block {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: background var(--transition);
}
.stat-block:hover { background: var(--bg-card-hover); }`);
css = css.replace(/\.stat-block \.label\s*\{[^}]+\}/, '.stat-block .label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }');
css = css.replace(/\.stat-block \.value\s*\{[^}]+\}/, '.stat-block .value { font-size: 48px; font-weight: 800; line-height: 1; color: #FFFFFF; }');
css = css.replace(/\.stat-block \.unit\s*\{[^}]+\}/, '.stat-block .unit { font-size: 16px; color: rgba(255,255,255,0.5); font-weight: 400; margin-left: 4px; vertical-align: middle; }');
css = css.replace(/\.stat-block \.sub\s*\{[^}]+\}/, '.stat-block .sub { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 8px; }');

// 6. Borders for Gym/Run stats
css = css.replace(/\.stat-block\.accent\s*\{[\s\S]*?\}/, `.stat-block.accent { border-left: 3px solid var(--accent); }`);
css = css.replace(/\.stat-block\.blue\s*\{[\s\S]*?\}/, `.stat-block.blue { border-left: 3px solid rgba(255,255,255,0.5); }`);

// 7. Buttons
css = css.replace(/\.btn-primary\s*\{[\s\S]*?\}/, `.btn-primary {
  background: var(--accent);
  color: #000000;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 100px;
  padding: 14px 24px;
  border: none;
  width: 100%;
}
.btn-primary:hover:not(:disabled) { background: #bdfa46; transform: translateY(-1px); }`);
css = css.replace(/\.btn-secondary\s*\{[\s\S]*?\}/, `.btn-secondary {
  background: transparent;
  color: #FFFFFF;
  border: 1px solid var(--border-strong);
  border-radius: 100px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 14px 24px;
  width: 100%;
}
.btn-secondary:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.2); }`);
css = css.replace(/\.btn-blue\s*\{[\s\S]*?\}/, `.btn-blue {
  background: #FFFFFF;
  color: #000000;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 100px;
  padding: 14px 24px;
  border: none;
  width: 100%;
}
.btn-blue:hover { background: #f0f0f0; transform: translateY(-1px); }`);

// 8. Sidebar
css = css.replace(/\.sidebar\s*\{[\s\S]*?\}/, `.sidebar {
  width: var(--sidebar-w);
  background: #0A0A0A;
  border-right: 1px solid var(--border);
  display: none;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100dvh;
  z-index: 100;
  flex-shrink: 0;
}`);
css = css.replace(/\.nav-item\s*\{[\s\S]*?\}/, `.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 0;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: color var(--transition);
  border-left: 3px solid transparent;
}
.nav-item:hover { color: #FFFFFF; background: none; }
.nav-item.active, .nav-item.active-blue { color: #FFFFFF; border-left-color: var(--accent); background: none; }`);
css = css.replace(/\.nav-label\s*\{[^}]+\}/g, '.nav-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.25); padding: 16px 14px 8px; }');
css = css.replace(/\.sidebar-logo h1\s*\{[^}]+\}/g, '.sidebar-logo h1 { font-size: 15px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }');

// 9. Bottom Nav
css = css.replace(/\.bottom-nav\s*\{[\s\S]*?\}/, `.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 56px;
  background: #111111;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  z-index: 200;
}`);
css = css.replace(/\.bottom-nav-item\s*\{[\s\S]*?\}/, `.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  transition: color var(--transition);
  position: relative;
  font-size: 0;
}
.bottom-nav-item:hover { color: rgba(255,255,255,0.6); }
.bottom-nav-item.active, .bottom-nav-item.active-blue { color: #FFFFFF; }
.bottom-nav-item.active::before, .bottom-nav-item.active-blue::before {
  content: '';
  position: absolute;
  top: -8px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
}`);

// 10. Filter Chips
css = css.replace(/\.chip\s*\{[\s\S]*?\}/, `.chip {
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all var(--transition);
}
.chip:hover { background: rgba(255,255,255,0.1); color: #FFF; }
.chip.active, .chip.active-blue { background: #AAFF00; color: #000; font-weight: 600; box-shadow: none; border: none; }`);

// 11. Streak Row
css = css.replace(/\.streak-dot\s*\{[\s\S]*?\}/, `.streak-dot {
  flex: 1; min-width: 32px;
  height: 48px; border-radius: 12px;
  border: none;
  background: var(--bg-surface);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 4px;
  transition: all var(--transition);
}
.streak-dot.active { background: var(--accent); }
.streak-dot.today { outline: 1px solid var(--accent); }
.streak-dot \.day-label { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: rgba(255,255,255,0.5); }
.streak-dot\.active \.day-label { color: #000; }
.streak-dot \.dot-fill { display: none; }`);

// 12. Form Inputs
css = css.replace(/\.form-input\s*\{[\s\S]*?\}/, `.form-input {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: #FFFFFF;
  padding: 12px 16px;
  font-size: 14px;
  transition: border-color var(--transition);
  width: 100%;
}
.form-input:focus { outline: none; border-color: var(--accent); }
.form-input::placeholder { color: var(--text-muted); }`);

// 13. Empty State
css = css.replace(/\.empty-state svg\s*\{[^}]+\}/, '.empty-state svg { opacity: 0.2; margin-bottom: 8px; }');
css = css.replace(/\.empty-state p\s*\{[^}]+\}/, '.empty-state p { font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.5); }');
css = css.replace(/\.empty-state small\s*\{[^}]+\}/, '.empty-state small { font-size: 13px; color: rgba(255,255,255,0.3); }');

fs.writeFileSync('src/index.css', css);
