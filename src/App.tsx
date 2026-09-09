import { useState } from 'react';
import Header from './components/Header';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import StepGuide from './components/StepGuide';
import ConfigTabs from './components/ConfigTabs';
import TroubleshootingSection from './components/TroubleshootingSection';
import QuickScripts from './components/QuickScripts';

function App() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <OverviewSection />
            <ArchitectureDiagram />
          </div>
        )}
        {activeSection === 'setup' && (
          <div className="space-y-8">
            <StepGuide />
          </div>
        )}
        {activeSection === 'configs' && (
          <div className="space-y-8">
            <ConfigTabs />
          </div>
        )}
        {activeSection === 'scripts' && (
          <div className="space-y-8">
            <QuickScripts />
          </div>
        )}
        {activeSection === 'troubleshoot' && (
          <div className="space-y-8">
            <TroubleshootingSection />
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Fedora 43 Dual VPN Solution • mihomo + openvpn3 • 2025</p>
        </div>
      </footer>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Решение: mihomo + openvpn3</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto">
          Архитектурно верный способ одновременной работы корпоративного VPN и обхода блокировок 
          на Fedora 43 без конфликтов TUN-интерфейсов
        </p>
      </div>

      {/* Key Insight */}
      <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700/50 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-xl font-bold text-blue-300 mb-2">Ключевая идея</h3>
            <p className="text-gray-300 leading-relaxed">
              Вместо двух конфликтующих TUN-интерфейсов (Amnezia + openvpn3), мы используем{' '}
              <strong className="text-cyan-300">mihomo (Clash Meta)</strong> как единственный TUN 
              с интеллектуальными правилами маршрутизации. openvpn3 остаётся для корпоративных подсетей 
              через <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm">ip route</code>, 
              а mihomo перехватывает только нужный трафик.
            </p>
          </div>
        </div>
      </div>

      {/* Important note */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/40 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="text-lg font-bold text-green-300 mb-1">Важно</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Amnezia VPN <strong className="text-green-200">не трогаем</strong> — запускаешь её по необходимости. 
              mihomo и Amnezia могут работать параллельно, просто не запускай их одновременно.
            </p>
          </div>
        </div>
      </div>

      {/* Problem vs Solution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-900/10 border border-red-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <span>❌</span> Почему не работало
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Два TUN-интерфейса претендуют на маршрут по умолчанию → race condition</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Amnezia агрессивно перехватывает маршруты → keepalive vpn2 уходит в tun2</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>systemd-resolved не справляется со split-horizon DNS при двух VPN</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>NekoRay не поддерживает VLESS+Reality в GUI-режиме</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-900/10 border border-green-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <span>✅</span> Как решает mihomo
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Один TUN-интерфейс с правилами: домен/IP → действие</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Встроенная поддержка VLESS+Reality из коробки</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>Собственный DNS-резолвер с правилами для каждого домена</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              <span>vpn2 работает через ip route — не конфликтует с mihomo</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Traffic Flow Summary */}
      <div className="bg-[#1a2235] border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-center">🔄 Поток трафика</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🇷🇺</div>
            <div className="font-bold text-green-300">Российские сайты</div>
            <div className="text-sm text-gray-400 mt-1">→ DIRECT (через Wi-Fi)</div>
          </div>
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <div className="font-bold text-blue-300">Cursor, GitHub, Anthropic</div>
            <div className="text-sm text-gray-400 mt-1">→ mihomo TUN → VLESS+Reality</div>
          </div>
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🏢</div>
            <div className="font-bold text-purple-300">Корпоративные (*.lan, *.tdata.tech)</div>
            <div className="text-sm text-gray-400 mt-1">→ ip route → vpn2 (tun0)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
