import { getDashboardData } from './data';
import Dashboard from './dashboard';

export default async function ServerDashboard() {
  const data = await getDashboardData();
  return <Dashboard initialData={data} />;
}