interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Обзор', icon: '🏠' },
  { id: 'setup', label: 'Пошаговая установка', icon: '📋' },
  { id: 'configs', label: 'Конфигурации', icon: '⚙️' },
  { id: 'scripts', label: 'Скрипты', icon: '🔧' },
  { id: 'troubleshoot', label: 'Диагностика', icon: '🔍' },
];

export default function Header({ activeSection, setActiveSection }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
              🔐
            </div>
            <span className="font-bold text-lg hidden sm:block">Fedora Dual VPN</span>
          </div>
          
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === item.id
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-600/50'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
