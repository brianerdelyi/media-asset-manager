interface DriveStatusBadgeProps { isOnline: boolean; }

export function DriveStatusBadge({ isOnline }: DriveStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isOnline ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
