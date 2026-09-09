import CodeBlock from './CodeBlock';

const steps = [
  {
    number: 1,
    title: 'Подготовка: Отключаем Amnezia и чистим артефакты',
    description: 'Amnezia оставляем установленным (на всякий случай), но гарантируем что он НЕ запущен и не стартует автоматически. Чистим残留 маршруты и правила от предыдущих попыток.',
    commands: [
      '# === ОТКЛЮЧАЕМ Amnezia (НЕ удаляем!) ===',
      '',
      '# Остановить сервис Amnezia если запущен',
      'sudo systemctl stop amneziavpn 2>/dev/null || true',
      '',
      '# Запретить автозапуск (чтобы не стартовал при загрузке)',
      'sudo systemctl disable amneziavpn 2>/dev/null || true',
      '',
      '# Убить процесс если висит',
      'sudo pkill -f amnezia 2>/dev/null || true',
      '',
      '# === ЧИСТИМ АРТЕФАКТЫ от предыдущих попыток ===',
      '',
      '# Удалить TUN-интерфейс Amnezia если остался активным',
      'sudo ip link delete tun2 2>/dev/null || true',
      '',
      '# Сбросить маршруты по умолчанию (вернуть Wi-Fi как единственный шлюз)',
      'sudo ip route flush table main proto static scope global 2>/dev/null || true',
      '',
      '# Очистить残留 iptables/ipset правила (от попытки 3)',
      'sudo iptables -F',
      'sudo iptables -t mangle -F',
      'sudo ipset destroy ru_ipset 2>/dev/null || true',
      '',
      '# === ПРОВЕРКА ===',
      '',
      '# Убедиться что Amnezia не запущен',
      'systemctl is-active amneziavpn  # должно быть: inactive',
      '',
      '# Проверить что нет лишних TUN-интерфейсов',
      'ip link show | grep tun',
      '',
      '# Проверить что интернет работает напрямую',
      'curl -s https://httpbin.org/ip | jq',
    ],
  },
  {
    number: 2,
    title: 'Установка mihomo (Clash Meta)',
    description: 'Устанавливаем mihomo — open-source ядро с полной поддержкой VLESS+Reality.',
    commands: [
      '# Скачать последнюю версию mihomo',
      '# (для x86_64 Linux)',
      'cd /tmp',
      'Mihomo_VERSION=$(curl -s https://api.github.com/repos/MetaCubeX/mihomo/releases/latest | jq -r .tag_name)',
      'curl -LO "https://github.com/MetaCubeX/mihomo/releases/download/${Mihomo_VERSION}/mihomo-linux-amd64-${Mihomo_VERSION}.gz"',
      'gunzip mihomo-linux-amd64-*.gz',
      'sudo mv mihomo-linux-amd64-* /usr/local/bin/mihomo',
      'sudo chmod +x /usr/local/bin/mihomo',
      '',
      '# Проверить версию',
      'mihomo -v',
      '',
      '# Создать директорию конфигурации',
      'sudo mkdir -p /etc/mihomo',
      'sudo chown $USER:$USER /etc/mihomo',
    ],
  },
  {
    number: 3,
    title: 'Настройка vpn2 (openvpn3) — только маршруты',
    description: 'Настраиваем openvpn3 так, чтобы он НЕ добавлял маршрут по умолчанию. Только корпоративные подсети.',
    commands: [
      '# Вариант A: В конфиге .ovpn добавить:',
      '# route-nopull',
      '# route 10.42.0.0 255.255.0.0',
      '# route 172.16.0.0 255.240.0.0',
      '# route <IP_сервера_vpn.rt.ru> 255.255.255.255 net_gateway',
      '',
      '# Вариант B: Если нельзя менять .ovpn, используем override:',
      '# В /etc/openvpn/client/client.conf добавить:',
      '# route-noexec',
      '# route-up /etc/openvpn/custom-routes.sh',
      '',
      '# Запустить vpn2',
      'openvpn3 session-start --config /path/to/vpn2.ovpn',
      '',
      '# Проверить что tun0 появился',
      'ip addr show tun0',
      '',
      '# Проверить маршруты через tun0',
      'ip route show dev tun0',
    ],
  },
  {
    number: 4,
    title: 'Создание конфигурации mihomo',
    description: 'Создаём YAML-конфиг с VLESS+Reality proxy, правилами split-tunneling и DNS.',
    commands: [
      '# Создать конфиг (см. вкладку "Конфигурации" для полного файла)',
      'cat > /etc/mihomo/config.yaml << \'EOF\'',
      '# ... содержимое из вкладки "Конфигурации" ...',
      'EOF',
      '',
      '# Проверить синтаксис конфига',
      'mihomo -d /etc/mihomo -t',
    ],
  },
  {
    number: 5,
    title: 'Создание systemd-сервиса для mihomo',
    description: 'Настраиваем автоматический запуск mihomo с TUN-интерфейсом.',
    commands: [
      'sudo tee /etc/systemd/system/mihomo.service << \'EOF\'',
      '[Unit]',
      'Description=mihomo Daemon',
      'After=network.target NetworkManager.service',
      '',
      '[Service]',
      'Type=simple',
      'User=root',
      'CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_RAW CAP_NET_BIND_SERVICE',
      'AmbientCapabilities=CAP_NET_ADMIN CAP_NET_RAW CAP_NET_BIND_SERVICE',
      'ExecStart=/usr/local/bin/mihomo -d /etc/mihomo',
      'Restart=on-failure',
      'RestartSec=5',
      '',
      '[Install]',
      'WantedBy=multi-user.target',
      'EOF',
      '',
      '# Включить и запустить',
      'sudo systemctl daemon-reload',
      'sudo systemctl enable mihomo',
      'sudo systemctl start mihomo',
      '',
      '# Проверить статус',
      'sudo systemctl status mihomo',
      'ip addr show utun  # TUN-интерфейс mihomo',
    ],
  },
  {
    number: 6,
    title: 'Настройка DNS: mihomo как системный резолвер',
    description: 'Переключаем systemd-resolved на использование mihomo DNS (порт 1053).',
    commands: [
      '# Указать systemd-resolved использовать mihomo DNS',
      'sudo mkdir -p /etc/systemd/resolved.conf.d',
      'sudo tee /etc/systemd/resolved.conf.d/mihomo.conf << \'EOF\'',
      '[Resolve]',
      'DNS=127.0.0.1#1053',
      'DNSStubListenerExtra=0.0.0.0',
      'EOF',
      '',
      '# Перезапустить resolved',
      'sudo systemctl restart systemd-resolved',
      '',
      '# Проверить',
      'resolvectl status',
      '',
      '# Тест: корпоративный домен должен резолвиться через vpn2',
      'resolvectl query some-host.lan',
      '',
      '# Тест: заблокированный сайт через mihomo',
      'curl -x socks5h://127.0.0.1:7890 https://api.anthropic.com -v',
    ],
  },
  {
    number: 7,
    title: 'Финальная проверка',
    description: 'Проверяем что весь трафик идёт правильно.',
    commands: [
      '# 1. Российские сайты — DIRECT',
      'curl -s https://ya.ru | head -1  # Должен работать напрямую',
      '',
      '# 2. Корпоративные ресурсы — через vpn2',
      'curl -v https://some-host.lan  # Должен идти через tun0',
      'traceroute some-host.lan  # Первый хоп — vpn2 gateway',
      '',
      '# 3. Заблокированные — через mihomo → VLESS',
      'curl https://api.anthropic.com  # Должен работать',
      'curl https://cursor.sh  # Должен работать',
      '',
      '# 4. Проверить что vpn2 сессия жива',
      'openvpn3 sessions-list',
      '',
      '# 5. Проверить логи mihomo',
      'sudo journalctl -u mihomo -f --no-pager',
    ],
  },
];

export default function StepGuide() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-2">Пошаговая установка</h2>
        <p className="text-gray-400">7 шагов от очистки до работающей системы</p>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="bg-[#1a2235] border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-lg shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{step.description}</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <CodeBlock code={step.commands.join('\n')} language="bash" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
