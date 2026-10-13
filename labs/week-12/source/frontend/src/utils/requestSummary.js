export function summarizeRequests(requests = []) {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    inProgress: requests.filter((r) => r.status === 'in-progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };
}