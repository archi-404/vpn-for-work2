import { useState } from 'react';
import CodeBlock from './CodeBlock';

const troubleshootingItems = [
  {
    title: 'mihomo не запускается — ошибка TUN',
    symptoms: 'Failed to start: operation not permitted / no such device',
    solution: `# Проверить что ядро поддерживает TUN
lsmod | grep tun

# Если модуль не загружен:
sudo modprobe tun

# Добавить в автозагрузку:
echo "tun" | sudo tee /etc/modules-load.d/tun.conf

# Проверить права mihomo:
sudo setcap cap_net_admin,cap_net_raw+ep /usr/local/bin/mihomo

# Или запускать от root (как в systemd-сервисе выше)`,
  },
  {
    title: 'vpn2 сессия умирает при включении mihomo',
    symptoms: 'openvpn3 session disconnects after mihomo starts',
    solution: `# Причина: mihomo перехватывает keepalive пакеты vpn2
# Решение: исключить подсети vpn2 из TUN mihomo

# В config.yaml mihomo добавить в tun.route-exclude-address:
#   - 10.42.0.0/16
#   - 172.16.0.0/12
#   - IP_сервера_vpn2/32

# Также проверить что vpn2 НЕ пушит default route:
# В .ovpn файле должно быть: route-nopull
# Или в custom-routes.sh не добавлять default gateway

# Проверить маршруты:
ip route show table main | grep default
# Должен быть ТОЛЬКО через Wi-Fi, НЕ через tun0

# Если vpn2 пушит default route, добавить в .ovpn:
# route-gateway 10.42.0.1
# redirect-gateway def1 bypass-dhcp`,
  },
  {
    title: 'Корпоративные домены не резолвятся',
    symptoms: 'resolvectl query some-host.lan → failed',
    solution: `# Проверить что vpn2 активен:
openvpn3 sessions-list

# Проверить DNS через vpn2 напрямую:
dig @172.16.8.19 some-host.lan

# Если dig работает, но resolvectl нет:
# Проблема в systemd-resolved — он не знает что .lan → tun0

# Решение 1: Через mihomo nameserver-policy (рекомендуется)
# Уже настроено в config.yaml

# Решение 2: Добавить в /etc/hosts (100% надёжно)
echo "10.42.x.x  some-host.lan" | sudo tee -a /etc/hosts

# Решение 3: Настроить resolvectl для tun0
resolvectl dns tun0 172.16.8.19
resolvectl domain tun0 ~lan ~tdata.tech ~rt.ru
resolvectl default-route tun0 no`,
  },
  {
    title: 'Cursor не видит прокси / не работает через VPN',
    symptoms: 'Cursor shows "not connected" or API errors',
    solution: `# Cursor должен работать автоматически через mihomo TUN
# Если не работает:

# 1. Проверить что mihomo TUN активен:
ip addr show utun

# 2. Проверить что трафик до api.anthropic.com идёт через mihomo:
sudo ss -tnp | grep anthropic

# 3. Если Cursor использует свой DNS, отключить его:
# В Cursor Settings → General → DNS over HTTPS → OFF

# 4. Альтернатива: SOCKS5 прокси для Cursor
# mihomo также слушает на порту 7890 (mixed-port)
# В Cursor: Settings → HTTP Proxy → socks5://127.0.0.1:7890

# 5. Проверить логи mihomo:
sudo journalctl -u mihomo -f | grep -i anthropic`,
  },
  {
    title: 'После перезагрузки всё сломалось',
    symptoms: 'System works after setup but breaks after reboot',
    solution: `# Убедиться что сервисы включены:
sudo systemctl is-enabled mihomo
sudo systemctl is-enabled openvpn3@vpn2  # если настроен

# Проверить порядок загрузки:
# mihomo должен стартовать ПОСЛЕ NetworkManager
# В systemd-сервисе: After=network.target NetworkManager.service

# Если vpn2 не поднимается автоматически:
sudo systemctl enable openvpn3@vpn2

# Проверить что конфиги на месте:
ls -la /etc/mihomo/config.yaml
ls -la /etc/openvpn/client/

# Логи загрузки:
sudo journalctl -b | grep -E "(mihomo|openvpn|tun)"`,
  },
  {
    title: 'Проверка: куда уходит конкретный запрос',
    symptoms: 'Непонятно, через какой интерфейс идёт трафик',
    solution: `# Отследить маршрут конкретного домена:

# 1. Определить IP домена:
dig +short api.anthropic.com

# 2. Посмотреть маршрут до этого IP:
ip route get <IP>

# 3. Отслеживать пакеты в реальном времени:
sudo tcpdump -i any -n host <IP>

# 4. Для проверки mihomo правил:
curl -s http://127.0.0.1:9090/rules | jq '.rules[] | select(.type == "Domain")'

# 5. API mihomo — активные соединения:
curl -s http://127.0.0.1:9090/connections | jq '.connections[] | {host: .metadata.host, chain: .chain}'`,
  },
];

export default function TroubleshootingSection() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">Диагностика проблем</h2>
        <p className="text-gray-400">Решения типичных проблем и команды для отладки</p>
      </div>

      <div className="space-y-4">
        {troubleshootingItems.map((item, index) => (
          <TroubleshootingCard key={index} {...item} />
        ))}
      </div>

      {/* Quick diagnostic commands */}
      <div className="bg-[#1a2235] border border-gray-700 rounded-xl p-6 mt-8">
        <h3 className="text-xl font-bold mb-4">🩺 Быстрая диагностика (копируйте по одной)</h3>
        <CodeBlock
          language="bash"
          code={`# === ПОЛНАЯ ДИАГНОСТИКА ===

# 1. Состояние всех интерфейсов
echo "=== INTERFACES ==="
ip -br addr show | grep -E "(tun|utun|wlp|eth)"

# 2. Таблица маршрутов
echo "=== ROUTES ==="
ip route show table main

# 3. VPN сессии
echo "=== VPN SESSIONS ==="
openvpn3 sessions-list 2>/dev/null || echo "openvpn3 not running"
sudo systemctl status mihomo --no-pager | head -5

# 4. DNS конфигурация
echo "=== DNS ==="
resolvectl status | grep -A5 "Global\\|Current DNS"

# 5. Тесты连通性
echo "=== CONNECTIVITY ==="
echo -n "Russian site (direct): "
curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://ya.ru && echo " ✓"
echo -n "Corporate (vpn2): "
curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://some-host.lan 2>/dev/null && echo " ✓" || echo " ✗ (check vpn2)"
echo -n "Blocked site (mihomo): "
curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://api.anthropic.com && echo " ✓" || echo " ✗ (check mihomo)"

# 6. mihomo API
echo "=== MIHOMO STATUS ==="
curl -s http://127.0.0.1:9090/version 2>/dev/null | jq . || echo "mihomo API not available"

# 7. Активные соединения через mihomo
echo "=== ACTIVE CONNECTIONS ==="
curl -s http://127.0.0.1:9090/connections 2>/dev/null | jq '.connections | length' || echo "N/A"`}
        />
      </div>
    </div>
  );
}

function TroubleshootingCard({ title, symptoms, solution }: { title: string; symptoms: string; solution: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#1a2235] border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{isOpen ? '🔓' : '🔒'}</span>
          <span className="font-medium text-white">{title}</span>
        </div>
        <span className="text-gray-400 text-sm">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-700/50 pt-4">
          <div className="bg-red-900/10 border border-red-800/30 rounded-lg p-3">
            <span className="text-sm font-medium text-red-300">Симптомы: </span>
            <span className="text-sm text-gray-300">{symptoms}</span>
          </div>
          <CodeBlock code={solution} language="bash" />
        </div>
      )}
    </div>
  );
}
