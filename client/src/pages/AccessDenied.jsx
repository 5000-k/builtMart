import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AccessDenied = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 mx-auto bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Only administrators can access the admin panel. Your account
            doesn't have the required admin credentials.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/"
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="btn btn-outline flex items-center justify-center gap-2"
              >
                <LogIn size={20} />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;