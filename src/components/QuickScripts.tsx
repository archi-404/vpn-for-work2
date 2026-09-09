import CodeBlock from './CodeBlock';

const scripts = [
  {
    title: '🚀 Полный скрипт установки (one-liner)',
    description: 'Запускает всю установку от очистки до финальной проверки',
    code: `#!/bin/bash
# install-dual-vpn.sh — полная установка mihomo + openvpn3
# Запуск: sudo bash install-dual-vpn.sh
set -e

echo "=== Fedora Dual VPN Setup ==="
echo "mihomo (Clash Meta) + openvpn3"

# 1. Чистим артефакты от предыдущих попыток
echo "[1/7] Cleaning up leftover routes/rules..."
sudo ip link delete tun2 2>/dev/null || true
sudo iptables -F 2>/dev/null || true
sudo iptables -t mangle -F 2>/dev/null || true
sudo ipset destroy ru_ipset 2>/dev/null || true

# 2. Установка mihomo
echo "[2/7] Installing mihomo..."
cd /tmp
VERSION=$(curl -s https://api.github.com/repos/MetaCubeX/mihomo/releases/latest | grep tag_name | cut -d'"' -f4)
curl -LO "https://github.com/MetaCubeX/mihomo/releases/download/\${VERSION}/mihomo-linux-amd64-\${VERSION}.gz"
gunzip -f mihomo-linux-amd64-*.gz
sudo mv mihomo-linux-amd64-* /usr/local/bin/mihomo
sudo chmod +x /usr/local/bin/mihomo
sudo mkdir -p /etc/mihomo
sudo chown $USER:$USER /etc/mihomo
echo "mihomo version: $(mihomo -v)"

# 3. TUN module
echo "[3/7] Setting up TUN module..."
sudo modprobe tun
echo "tun" | sudo tee /etc/modules-load.d/tun.conf

# 4. systemd-resolved config
echo "[4/7] Configuring DNS..."
sudo mkdir -p /etc/systemd/resolved.conf.d
sudo tee /etc/systemd/resolved.conf.d/mihomo.conf > /dev/null << 'DNSCONF'
[Resolve]
DNS=127.0.0.1#1053
DNSStubListenerExtra=0.0.0.0
DNSCONF
sudo systemctl restart systemd-resolved

# 5. mihomo systemd service
echo "[5/7] Creating mihomo service..."
sudo tee /etc/systemd/system/mihomo.service > /dev/null << 'SERVICE'
[Unit]
Description=mihomo Daemon
After=network.target NetworkManager.service

[Service]
Type=simple
User=root
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_RAW CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_RAW CAP_NET_BIND_SERVICE
ExecStart=/usr/local/bin/mihomo -d /etc/mihomo
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE
sudo systemctl daemon-reload
sudo systemctl enable mihomo

# 6. Config placeholder
echo "[6/7] Creating config placeholder..."
if [ ! -f /etc/mihomo/config.yaml ]; then
  echo "# ВСТАВЬТЕ СЮДА КОНФИГ ИЗ ВКЛАДКИ 'Конфигурации'" > /etc/mihomo/config.yaml
  echo "⚠️  Отредактируйте /etc/mihomo/config.yaml — вставьте полный конфиг!"
fi

# 7. Summary
echo "[7/7] Done!"
echo ""
echo "=== NEXT STEPS ==="
echo "1. Отредактируйте /etc/mihomo/config.yaml"
echo "   (скопируйте конфиг из вкладки 'Конфигурации')"
echo "2. Замените YOUR_SERVER_IP, YOUR_UUID, etc."
echo "3. Проверьте конфиг: mihomo -d /etc/mihomo -t"
echo "4. Запустите: sudo systemctl start mihomo"
echo "5. Запустите vpn2: openvpn3 session-start --config /path/to/vpn2.ovpn"`,
  },
  {
    title: '🔄 Переключатель режимов',
    description: 'Скрипт для быстрого переключения между режимами работы',
    code: `#!/bin/bash
# vpn-mode.sh — переключение режимов VPN
# Использование: ./vpn-mode.sh [full|corporate|direct]

MODE=\${1:-status}

case "$MODE" in
  full)
    echo "🌍 Full mode: mihomo + vpn2"
    sudo systemctl start mihomo
    openvpn3 session-start --config /path/to/vpn2.ovpn 2>/dev/null || true
    echo "✓ All VPNs active"
    ;;
  corporate)
    echo "🏢 Corporate only: vpn2"
    sudo systemctl stop mihomo
    openvpn3 session-start --config /path/to/vpn2.ovpn 2>/dev/null || true
    echo "✓ Corporate VPN active, mihomo stopped"
    ;;
  direct)
    echo "🇷🇺 Direct mode: no VPN"
    sudo systemctl stop mihomo
    openvpn3 session-stop --alias vpn2 2>/dev/null || true
    echo "✓ All VPNs stopped, direct connection"
    ;;
  status)
    echo "=== VPN Status ==="
    echo -n "mihomo: "
    systemctl is-active mihomo 2>/dev/null || echo "inactive"
    echo -n "vpn2: "
    openvpn3 sessions-list 2>/dev/null | grep -c "Connected" | xargs -I{} sh -c '[ {} -gt 0 ] && echo "active" || echo "inactive"'
    echo ""
    echo "=== Routes ==="
    ip route show | head -5
    ;;
  *)
    echo "Usage: $0 [full|corporate|direct|status]"
    exit 1
    ;;
esac`,
  },
  {
    title: '📊 Мониторинг и логи',
    description: 'Скрипт для мониторинга состояния VPN и трафика',
    code: `#!/bin/bash
# vpn-monitor.sh — мониторинг состояния VPN
# Запуск: watch -n 5 ./vpn-monitor.sh

clear
echo "╔══════════════════════════════════════════╗"
echo "║       VPN Monitor — $(date +%H:%M:%S)          ║"
echo "╠══════════════════════════════════════════╣"

# mihomo status
echo -n "║ mihomo: "
if systemctl is-active --quiet mihomo; then
  echo -e "✅ active       ║"
else
  echo -e "❌ inactive     ║"
fi

# vpn2 status
echo -n "║ vpn2:   "
if openvpn3 sessions-list 2>/dev/null | grep -q "Connected"; then
  echo -e "✅ connected    ║"
else
  echo -e "❌ disconnected ║"
fi

echo "╠══════════════════════════════════════════╣"

# Interfaces
echo "║ Interfaces:                              ║"
for iface in wlp2s0 tun0 utun; do
  status=$(ip -br addr show $iface 2>/dev/null | awk '{print $2}')
  if [ -n "$status" ]; then
    printf "║  %-6s %-30s ║\\n" "$iface" "$status"
  fi
done

echo "╠══════════════════════════════════════════╣"

# Connectivity tests
echo "║ Connectivity:                            ║"
echo -n "║  ya.ru (direct): "
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 https://ya.ru 2>/dev/null)
[ "$code" = "200" ] && echo -e "✅ 200               ║" || echo -e "❌ $code              ║"

echo -n "║  anthropic (proxy): "
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://api.anthropic.com 2>/dev/null)
[ "$code" != "000" ] && echo -e "✅ $code              ║" || echo -e "❌ timeout          ║"

echo "╠══════════════════════════════════════════╣"

# Active connections through mihomo
echo "║ Active proxy connections:                ║"
count=$(curl -s http://127.0.0.1:9090/connections 2>/dev/null | jq '.connections | length' 2>/dev/null)
echo "║  Count: \${count:-N/A}                            ║"

echo "╚══════════════════════════════════════════╝"`,
  },
  {
    title: '🛡️ Восстановление после сбоя',
    description: 'Если всё сломалось — этот скрипт вернёт интернет',
    code: `#!/bin/bash
# vpn-rescue.sh — аварийное восстановление интернета
# Запуск: sudo bash vpn-rescue.sh

echo "🚨 VPN Rescue Mode"
echo "Stopping all VPN services and restoring direct connection..."

# 1. Stop mihomo
echo "[1] Stopping mihomo..."
sudo systemctl stop mihomo 2>/dev/null || true

# 2. Kill mihomo process if still running
echo "[2] Killing mihomo process..."
sudo pkill -f mihomo 2>/dev/null || true

# 3. Remove mihomo TUN interface
echo "[3] Removing TUN interfaces..."
sudo ip link delete utun 2>/dev/null || true

# 4. Stop vpn2
echo "[4] Stopping vpn2..."
openvpn3 session-stop --alias vpn2 2>/dev/null || true
sudo ip link delete tun0 2>/dev/null || true

# 5. Flush routes
echo "[5] Flushing routes..."
sudo ip route flush table main proto static scope global 2>/dev/null || true

# 6. Flush iptables
echo "[6] Flushing iptables..."
sudo iptables -F 2>/dev/null || true
sudo iptables -t nat -F 2>/dev/null || true
sudo iptables -t mangle -F 2>/dev/null || true

# 7. Restore DNS
echo "[7] Restoring DNS..."
sudo rm -f /etc/systemd/resolved.conf.d/mihomo.conf
sudo systemctl restart systemd-resolved

# 8. Restart NetworkManager
echo "[8] Restarting NetworkManager..."
sudo systemctl restart NetworkManager

# 9. Wait and test
sleep 3
echo ""
echo "=== Testing connection ==="
echo -n "Internet: "
if curl -s -o /dev/null --max-time 5 https://ya.ru; then
  echo "✅ Working!"
else
  echo "❌ Still broken. Try: sudo nmcli networking off && sudo nmcli networking on"
fi

echo ""
echo "Direct connection restored. You can now fix configs and retry."`,
  },
];

export default function QuickScripts() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">Скрипты автоматизации</h2>
        <p className="text-gray-400">Готовые скрипты для установки, управления и восстановления</p>
      </div>

      <div className="space-y-6">
        {scripts.map((script, index) => (
          <div key={index} className="bg-[#1a2235] border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-bold text-white">{script.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{script.description}</p>
            </div>
            <div className="p-4">
              <CodeBlock code={script.code} language="bash" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick reference */}
      <div className="bg-[#1a2235] border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">⚡ Быстрые команды</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-blue-300">mihomo</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-400"><code className="text-green-300">sudo systemctl start mihomo</code> — запустить</p>
              <p className="text-gray-400"><code className="text-green-300">sudo systemctl stop mihomo</code> — остановить</p>
              <p className="text-gray-400"><code className="text-green-300">sudo systemctl restart mihomo</code> — перезапустить</p>
              <p className="text-gray-400"><code className="text-green-300">sudo journalctl -u mihomo -f</code> — логи</p>
              <p className="text-gray-400"><code className="text-green-300">mihomo -d /etc/mihomo -t</code> — тест конфига</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-purple-300">vpn2 (openvpn3)</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-400"><code className="text-green-300">openvpn3 session-start --config file.ovpn</code></p>
              <p className="text-gray-400"><code className="text-green-300">openvpn3 sessions-list</code></p>
              <p className="text-gray-400"><code className="text-green-300">openvpn3 session-manage --alias vpn2 --disconnect</code></p>
              <p className="text-gray-400"><code className="text-green-300">openvpn3 log --session-path /net/openvpn/v3/sessions/...</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
