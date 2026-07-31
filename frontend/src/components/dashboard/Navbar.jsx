import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      teacher: 'Enseignant',
      student: 'Étudiant',
      supervisor: 'Superviseur'
    };
    return labels[role] || role;
  };

  return (
    <div className="h-16 bg-white border-b border-blue-700 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo/Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-slate-900">Gestions Notes</h1>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <div className="w-8 h-8 bg-blue-700 border border-blue-700 rounded-none flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>

          {/* User Details */}
          <div className="text-right">
            <div className="text-sm font-medium text-slate-900">
              {user?.first_name || user?.username}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-[0.25em]">
              {getRoleLabel(user?.role)}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-slate-900 border border-blue-700 rounded-none hover:bg-blue-50"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;