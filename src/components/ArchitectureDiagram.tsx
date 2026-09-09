export default function ArchitectureDiagram() {
  return (
    <div className="bg-[#1a2235] border border-gray-700 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6 text-center">🏗️ Архитектура решения</h3>
      
      <div className="relative overflow-x-auto">
        <svg viewBox="0 0 900 500" className="w-full max-w-4xl mx-auto" xmlns="http://www.w3.org/2000/svg">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
            </pattern>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="900" height="500" fill="url(#grid)" rx="8"/>

          {/* Your Computer */}
          <rect x="350" y="20" width="200" height="70" rx="10" fill="url(#blueGrad)" stroke="#3b82f6" strokeWidth="2" filter="url(#glow)"/>
          <text x="450" y="50" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="bold">💻 Fedora 43</text>
          <text x="450" y="72" textAnchor="middle" fill="#64748b" fontSize="11">Приложения: Cursor, Firefox, Git</text>

          {/* mihomo TUN */}
          <rect x="320" y="130" width="260" height="80" rx="10" fill="url(#greenGrad)" stroke="#10b981" strokeWidth="2" filter="url(#glow)"/>
          <text x="450" y="158" textAnchor="middle" fill="#6ee7b7" fontSize="14" fontWeight="bold">🔀 mihomo (TUN: utun)</text>
          <text x="450" y="178" textAnchor="middle" fill="#94a3b8" fontSize="10">Правила маршрутизации + DNS</text>
          <text x="450" y="195" textAnchor="middle" fill="#94a3b8" fontSize="10">VLESS+Reality proxy | DIRECT</text>

          {/* Arrow from computer to mihomo */}
          <line x1="450" y1="90" x2="450" y2="130" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5"/>
          <polygon points="445,128 450,138 455,128" fill="#3b82f6"/>

          {/* vpn2 openvpn3 */}
          <rect x="30" y="280" width="220" height="80" rx="10" fill="url(#purpleGrad)" stroke="#8b5cf6" strokeWidth="2" filter="url(#glow)"/>
          <text x="140" y="310" textAnchor="middle" fill="#c4b5fd" fontSize="14" fontWeight="bold">🏢 vpn2 (openvpn3)</text>
          <text x="140" y="330" textAnchor="middle" fill="#94a3b8" fontSize="10">TUN: tun0 | Корпоративная сеть</text>
          <text x="140" y="347" textAnchor="middle" fill="#94a3b8" fontSize="10">10.42.0.0/16, 172.16.0.0/12</text>

          {/* VLESS+Reality Server */}
          <rect x="650" y="280" width="220" height="80" rx="10" fill="url(#blueGrad)" stroke="#06b6d4" strokeWidth="2" filter="url(#glow)"/>
          <text x="760" y="310" textAnchor="middle" fill="#67e8f9" fontSize="14" fontWeight="bold">🌐 VLESS+Reality</text>
          <text x="760" y="330" textAnchor="middle" fill="#94a3b8" fontSize="10">3x-ui сервер</text>
          <text x="760" y="347" textAnchor="middle" fill="#94a3b8" fontSize="10">Обход блокировок</text>

          {/* Arrows from mihomo */}
          {/* To vpn2 */}
          <line x1="370" y1="210" x2="200" y2="280" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5"/>
          <polygon points="203,275 195,282 205,283" fill="#8b5cf6"/>
          <text x="260" y="240" textAnchor="middle" fill="#a78bfa" fontSize="9" transform="rotate(-20, 260, 240)">ip route (corp subnets)</text>

          {/* To VLESS server */}
          <line x1="530" y1="210" x2="700" y2="280" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5"/>
          <polygon points="697,275 705,282 695,283" fill="#06b6d4"/>
          <text x="640" y="240" textAnchor="middle" fill="#22d3ee" fontSize="9" transform="rotate(20, 640, 240)">proxy (blocked sites)</text>

          {/* Destinations */}
          {/* Corporate */}
          <rect x="30" y="410" width="220" height="60" rx="8" fill="#1a1a2e" stroke="#8b5cf6" strokeWidth="1"/>
          <text x="140" y="435" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="bold">🏢 Корп. ресурсы</text>
          <text x="140" y="455" textAnchor="middle" fill="#64748b" fontSize="10">*.lan, *.tdata.tech, vpn.rt.ru</text>
          <line x1="140" y1="360" x2="140" y2="410" stroke="#8b5cf6" strokeWidth="1.5"/>
          <polygon points="135,408 140,418 145,408" fill="#8b5cf6"/>

          {/* International */}
          <rect x="650" y="410" width="220" height="60" rx="8" fill="#1a1a2e" stroke="#06b6d4" strokeWidth="1"/>
          <text x="760" y="435" textAnchor="middle" fill="#67e8f9" fontSize="12" fontWeight="bold">🌍 Международные</text>
          <text x="760" y="455" textAnchor="middle" fill="#64748b" fontSize="10">Cursor, GitHub, Anthropic</text>
          <line x1="760" y1="360" x2="760" y2="410" stroke="#06b6d4" strokeWidth="1.5"/>
          <polygon points="755,408 760,418 765,408" fill="#06b6d4"/>

          {/* Direct (Russian) */}
          <rect x="350" y="410" width="200" height="60" rx="8" fill="#1a1a2e" stroke="#10b981" strokeWidth="1"/>
          <text x="450" y="435" textAnchor="middle" fill="#6ee7b7" fontSize="12" fontWeight="bold">🇷🇺 Российские сайты</text>
          <text x="450" y="455" textAnchor="middle" fill="#64748b" fontSize="10">DIRECT через Wi-Fi</text>
          <line x1="450" y1="210" x2="450" y2="410" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3"/>
          <polygon points="445,408 450,418 455,408" fill="#10b981"/>

          {/* Wi-Fi adapter */}
          <rect x="380" y="310" width="140" height="40" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1"/>
          <text x="450" y="335" textAnchor="middle" fill="#94a3b8" fontSize="11">📡 wlp2s0 (Wi-Fi)</text>
          <line x1="450" y1="210" x2="450" y2="310" stroke="#475569" strokeWidth="1" strokeDasharray="2,2"/>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400">mihomo TUN — единая точка входа</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-400">vpn2 — только корп. подсети</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span className="text-gray-400">VLESS — обход блокировок</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span className="text-gray-400">DIRECT — российские сайты</span>
        </div>
      </div>
    </div>
  );
}
