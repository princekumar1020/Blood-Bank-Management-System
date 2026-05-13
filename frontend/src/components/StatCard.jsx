export default function StatCard({ title, value, icon, color, bgColor }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'users':
        return (
          <svg className={`w-8 h-8 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'droplet':
        return (
          <svg className={`w-8 h-8 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      case 'clock':
        return (
          <svg className={`w-8 h-8 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={10} />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        );
      default:
        return <div className={`w-8 h-8 ${color}`}>📊</div>;
    }
  };

  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className={`text-3xl font-bold ${color} mt-2`}>
            {value}
          </p>
        </div>
        <div className="flex-shrink-0">
          {getIcon(icon)}
        </div>
      </div>
    </div>
  );
}