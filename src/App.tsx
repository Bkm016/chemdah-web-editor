import { useEffect } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import { useApiStore } from './store/useApiStore';
import { useApiCenterStore } from './store/useApiCenterStore';

export default function App() {
  const loadApiData = useApiStore((state) => state.loadApiData);
  const loadAllEnabledSources = useApiCenterStore((state) => state.loadAllEnabledSources);

  useEffect(() => {
    // Load all enabled API sources first
    loadAllEnabledSources().then(() => {
      // Then sync to API store
      loadApiData();
    });
  }, [loadApiData, loadAllEnabledSources]);

  return <DashboardLayout />;
}
