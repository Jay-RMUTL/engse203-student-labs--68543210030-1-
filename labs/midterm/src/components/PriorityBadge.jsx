function PriorityBadge({ priority }) {
  const priorityMap = {
    high: { label: 'สูง', className: 'badge danger' },
    medium: { label: 'ปานกลาง', className: 'badge warning' },
    low: { label: 'ต่ำ', className: 'badge info' },
  };

  const config = priorityMap[priority?.toLowerCase()] || { label: priority, className: 'badge' };

  return (
    <span className={config.className} data-testid="priority-badge">
      {config.label}
    </span>
  );
}

export default PriorityBadge;