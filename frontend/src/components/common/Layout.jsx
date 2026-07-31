import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole, roleLabels } from "../../utils/roles";

function Layout({ children, currentPage, onNavigate, navigationItems = [] }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const normalizedRole = normalizeRole(user?.role);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".mobile-menu-toggle") && !event.target.closest(".mobile-nav")) {
        setIsMobileMenuOpen(false);
      }

      if (!event.target.closest(".profile-menu") && !event.target.closest(".profile-button")) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-40 relative bg-white border-b border-blue-700 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-slate-900 font-semibold text-lg leading-tight tracking-tight">Gestion Notes</div>
                <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-[0.14em]">{roleLabels[normalizedRole] || "Utilisateur"}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 no-print">
              <div className="relative">
                <button
                  type="button"
                  className="profile-button flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-none text-slate-900 hover:bg-slate-50 focus:outline-none focus:border-blue-700"
                  onClick={() => setIsProfileMenuOpen((current) => !current)}
                >
                  <div className="w-8 h-8 bg-blue-700 text-white rounded-none flex items-center justify-center text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.username || "Utilisateur"}</span>
                  <span className="text-xs">▼</span>
                </button>

                {isProfileMenuOpen && (
                  <div className="profile-menu absolute top-12 right-0 mt-2 w-64 bg-white border border-blue-700 rounded-none shadow-lg z-50">
                    <div className="p-4 border-b border-slate-200">
                      <div className="font-medium text-slate-900">{user?.username || "Utilisateur"}</div>
                      <div className="text-sm text-slate-600">{user?.email || roleLabels[normalizedRole]}</div>
                    </div>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-slate-900 hover:bg-slate-50"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="mobile-menu-toggle md:hidden p-2 text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-none no-print"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
              >
                <span className="block w-5 h-0.5 bg-slate-700 mb-1" />
                <span className="block w-5 h-0.5 bg-slate-700 mb-1" />
                <span className="block w-5 h-0.5 bg-slate-700" />
              </button>
            </div>
          </div>

          <div className="hidden md:block pb-3 no-print">
            <div className="overflow-x-auto border border-slate-300 bg-slate-50 px-2 py-2">
              <nav className="flex items-center gap-2 min-w-max pr-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`px-3 py-2 text-[13px] font-semibold whitespace-nowrap border rounded-none transition-colors focus:outline-none ${
                      currentPage === item.id
                        ? "bg-blue-700 text-white border-blue-700"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:border-blue-700 focus:border-blue-700"
                    }`}
                    onClick={() => onNavigate(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-nav md:hidden absolute top-full left-0 right-0 bg-white border-t border-blue-700 shadow-lg z-40 no-print">
            <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 border-b border-slate-200">
              Navigation
            </div>
            <nav className="max-h-[70vh] overflow-y-auto">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`w-full px-4 py-3 text-left border-b border-slate-200 last:border-b-0 text-sm font-semibold ${
                    currentPage === item.id ? "bg-blue-50 text-blue-700" : "text-slate-800 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
