import { useState } from 'react';
import CodeBlock from './CodeBlock';

const configs = [
  {
    id: 'mihomo',
    label: 'mihomo config.yaml',
    language: 'yaml',
    description: 'Основной конфиг mihomo с VLESS+Reality, split-tunneling и DNS',
    code: `# /etc/mihomo/config.yaml
# mihomo (Clash Meta) — полная конфигурация

mixed-port: 7890
allow-lan: false
bind-address: '*'
mode: rule
log-level: info
unified-delay: true
geodata-mode: true
tcp-concurrent: true
find-process-mode: strict

geodata-loader: standard
geo-auto-update: true
geo-update-interval: 24

geox-url:
  geoip: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat"
  geosite: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat"
  mmdb: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb"
  asn: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb"

profile:
  store-selected: true
  store-fake-ip: true

sniffer:
  enable: true
  sniff:
    HTTP:
      ports: [80, 8080-8880]
      override-destination: true
    TLS:
      ports: [443, 8443]
    QUIC:
      ports: [443, 8443]
  skip-domain:
    - 'Mijia Cloud'
    - '+.lan'
    - '+.tdata.tech'
    - '+.rt.ru'

tun:
  enable: true
  stack: mixed
  dns-hijack:
    - 'any:53'
  auto-route: true
  auto-detect-interface: true
  # ВАЖНО: Не перехватываем трафик на корпоративные подсети
  route-exclude-address:
    - 10.42.0.0/16
    - 172.16.0.0/12
    - 192.168.0.0/16

dns:
  enable: true
  ipv6: false
  prefer-h3: true
  listen: '0.0.0.0:1053'
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  fake-ip-filter:
    - '*.lan'
    - '*.tdata.tech'
    - '*.rt.ru'
    - 'dns.msftncsi.com'
    - 'www.msftncsi.com'
    - 'www.msftconnecttest.com'
  default-nameserver:
    - 1.1.1.1
    - 8.8.8.8
  nameserver:
    - 'https://dns.google/dns-query'
    - 'https://cloudflare-dns.com/dns-query'
  nameserver-policy:
    # Корпоративные домены → DNS vpn2 (через tun0)
    '+.lan':
      - '172.16.8.19'
    '+.tdata.tech':
      - '172.16.8.19'
    '+.rt.ru':
      - '172.16.8.19'
    # Российские сайты → российские DNS (напрямую)
    'geosite:ru':
      - 'https://dns.yandex.ru/dns-query'
      - 'https://dns.quad9.net/dns-query'
    # Заблокированные → через proxy (DoH через VLESS)
    'geosite:geolocation-!cn':
      - 'https://dns.google/dns-query'

# ============ PROXIES ============
proxies:
  - name: "VLESS-Reality"
    type: vless
    server: YOUR_SERVER_IP
    port: 443
    uuid: YOUR_UUID
    network: tcp
    udp: true
    tls: true
    flow: xtls-rprx-vision
    servername: YOUR_SNI
    reality-opts:
      public-key: YOUR_PUBLIC_KEY
      short-id: YOUR_SHORT_ID
    client-fingerprint: chrome

# ============ PROXY GROUPS ============
proxy-groups:
  - name: "🌍 Proxy"
    type: select
    proxies:
      - VLESS-Reality
      - DIRECT

  - name: "🇷🇺 Russia"
    type: select
    proxies:
      - DIRECT
      - "🌍 Proxy"

  - name: "🏢 Corporate"
    type: select
    proxies:
      - DIRECT  # Через vpn2 (tun0) — маршруты уже настроены

# ============ RULES ============
rules:
  # Корпоративные домены → DIRECT (через vpn2)
  - DOMAIN-SUFFIX,lan,DIRECT
  - DOMAIN-SUFFIX,tdata.tech,DIRECT
  - DOMAIN-SUFFIX,rt.ru,DIRECT
  
  # Российские сайты → DIRECT
  - GEOSITE,ru,DIRECT
  - GEOSITE,private,DIRECT
  
  # Заблокированные → Proxy
  - GEOSITE,telegram,"🌍 Proxy"
  - GEOSITE,twitter,"🌍 Proxy"
  - GEOSITE,openai,"🌍 Proxy"
  - GEOSITE,anthropic,"🌍 Proxy"
  - GEOSITE,github,"🌍 Proxy"
  - GEOSITE,google,"🌍 Proxy"
  
  # Конкретные домены для Cursor
  - DOMAIN-SUFFIX,cursor.sh,"🌍 Proxy"
  - DOMAIN-SUFFIX,cursor.com,"🌍 Proxy"
  - DOMAIN-SUFFIX,anthropic.com,"🌍 Proxy"
  - DOMAIN-SUFFIX,claude.ai,"🌍 Proxy"
  
  # GeoIP правила
  - GEOIP,ru,DIRECT
  - GEOIP,private,DIRECT
  
  # Всё остальное → Proxy (безопасный дефолт)
  - MATCH,"🌍 Proxy"`,
  },
  {
    id: 'openvpn',
    label: 'openvpn3 override',
    language: 'bash',
    description: 'Скрипт для openvpn3 чтобы он НЕ добавлял маршрут по умолчанию',
    code: `#!/bin/bash
# /etc/openvpn/custom-routes.sh
# Этот скрипт вызывается после установки VPN-соединения
# Он добавляет ТОЛЬКО нужные маршруты, игнорируя pushed routes

# Корпоративные подсети через VPN
ip route add 10.42.0.0/16 dev tun0 table main 2>/dev/null || true
ip route add 172.16.0.0/12 dev tun0 table main 2>/dev/null || true

# Если нужен конкретный хост vpn.rt.ru
# ip route add <VPN_SERVER_PUBLIC_IP>/32 via $(ip route | grep default | awk '{print $3}') dev wlp2s0

echo "Custom routes applied for vpn2"

# Альтернатива: модификация .ovpn файла
# Добавьте в начало .ovpn файла:
# ---
# route-nopull
# route 10.42.0.0 255.255.0.0
# route 172.16.0.0 255.240.0.0
# ---
# Это запретит openvpn3 принимать pushed routes от сервера
# и добавит только указанные вами`,
  },
  {
    id: 'resolved',
    label: 'systemd-resolved',
    language: 'ini',
    description: 'Конфиг systemd-resolved для работы с mihomo DNS',
    code: `# /etc/systemd/resolved.conf.d/mihomo.conf
# Настройка systemd-resolved для использования mihomo DNS

[Resolve]
# mihomo слушает на порту 1053
DNS=127.0.0.1#1053
# Отключаем стандартный stub listener чтобы не конфликтовал
DNSStubListenerExtra=0.0.0.0
#FallbackDNS=1.1.1.1 8.8.8.8

# Альтернативный вариант — если нужно чтобы resolved
# сам управлял DNS для корпоративных доменов:
# [Resolve]
# DNS=1.1.1.1
# Domains=~.
# # Для конкретного интерфейса tun0:
# # resolvectl dns tun0 172.16.8.19
# # resolvectl domain tun0 ~lan ~tdata.tech ~rt.ru`,
  },
  {
    id: 'firewall',
    label: 'firewalld rules',
    language: 'bash',
    description: 'Правила firewall для Fedora (если используется firewalld)',
    code: `#!/bin/bash
# /usr/local/bin/setup-firewall.sh
# Настройка firewall для корректной работы mihomo + vpn2

# Разрешить TUN-интерфейс mihomo
sudo firewall-cmd --permanent --new-zone=mihomo 2>/dev/null || true
sudo firewall-cmd --permanent --zone=mihomo --add-interface=utun
sudo firewall-cmd --permanent --zone=mihomo --add-service=dns
sudo firewall-cmd --permanent --zone=mihomo --add-masquerade

# Разрешить vpn2 интерфейс
sudo firewall-cmd --permanent --zone=trusted --add-interface=tun0

# Разрешить mihomo порты локально
sudo firewall-cmd --permanent --add-port=7890/tcp  # mixed-port
sudo firewall-cmd --permanent --add-port=7890/udp
sudo firewall-cmd --permanent --add-port=1053/tcp  # DNS
sudo firewall-cmd --permanent --add-port=1053/udp
sudo firewall-cmd --permanent --add-port=9090/tcp  # API

# Применить
sudo firewall-cmd --reload

# Проверить
sudo firewall-cmd --list-all-zones`,
  },
];

export default function ConfigTabs() {
  const [activeTab, setActiveTab] = useState('mihomo');
  const activeConfig = configs.find(c => c.id === activeTab)!;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">Конфигурационные файлы</h2>
        <p className="text-gray-400">Все необходимые конфиги для настройки системы</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-4">
        {configs.map((config) => (
          <button
            key={config.id}
            onClick={() => setActiveTab(config.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === config.id
                ? 'tab-active text-blue-300 border border-blue-600/50'
                : 'text-gray-400 hover:text-gray-200 bg-gray-800/30 hover:bg-gray-800/60'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Active Config */}
      <div className="bg-[#1a2235] border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">{activeConfig.label}</h3>
              <p className="text-sm text-gray-400 mt-1">{activeConfig.description}</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <CodeBlock code={activeConfig.code} language={activeConfig.language} />
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-900/10 border border-yellow-700/50 rounded-xl p-6">
        <h4 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
          <span>⚠️</span> Важно: Замените плейсхолдеры
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-300">В конфиге mihomo замените:</p>
            <ul className="space-y-1 text-gray-400">
              <li><code className="bg-gray-800 px-1 rounded text-yellow-300">YOUR_SERVER_IP</code> → IP вашего 3x-ui сервера</li>
              <li><code className="bg-gray-800 px-1 rounded text-yellow-300">YOUR_UUID</code> → UUID из панели</li>
              <li><code className="bg-gray-800 px-1 rounded text-yellow-300">YOUR_SNI</code> → SNI (servername)</li>
              <li><code className="bg-gray-800 px-1 rounded text-yellow-300">YOUR_PUBLIC_KEY</code> → public key Reality</li>
              <li><code className="bg-gray-800 px-1 rounded text-yellow-300">YOUR_SHORT_ID</code> → short ID</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-gray-300">Как получить из 3x-ui:</p>
            <ul className="space-y-1 text-gray-400">
              <li>1. Зайдите в панель 3x-ui</li>
              <li>2. Откройте нужный inbound (VLESS+Reality)</li>
              <li>3. Нажмите "Share" или "Get Link"</li>
              <li>4. Скопируйте vless:// ссылку</li>
              <li>5. Распарсите её или вставьте в конфиг</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
