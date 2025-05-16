import React from 'react';
import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  gradient?: string;
  comingSoon?: boolean;
}

const Placeholder: React.FC<PlaceholderProps> = ({
  title,
  description,
  icon = <Construction size={64} />,
  gradient = 'from-primary-100 to-primary-50',
  comingSoon = true
}) => {
  return (
    <div className="min-h-[70vh] bg-gray-50 py-8">
      <div className="container-custom h-full">
        <div className={`flex h-full flex-col items-center justify-center rounded-xl bg-gradient-to-br ${gradient} p-12 text-center`}>
          <div className="mb-6 text-primary-500">
            {icon}
          </div>
          <h1 className="mb-4 text-3xl font-bold">{title}</h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-600">{description}</p>
          {comingSoon && (
            <div className="mb-6 rounded-full bg-primary-500 px-6 py-2 text-sm font-medium text-white">
              Coming Soon
            </div>
          )}
          <Link to="/" className="btn-outline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Placeholder;