import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackHome = () => {
  return (
    <div className="mt-6 text-center">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>
    </div>
  );
};

export default BackHome;