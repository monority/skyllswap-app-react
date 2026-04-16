interface StatusBadgeProps {
  status: string;
  label: string;
}

function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusClass = status === 'ok' ? 'up' : 'down';

  return (
    <span className={`status ${statusClass}`}>
      {label}: {status}
    </span>
  );
}

export default StatusBadge;
