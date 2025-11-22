import { useEffect, useRef } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import { useApiStore } from './store/useApiStore';
import { useApiCenterStore } from './store/useApiCenterStore';

export default function App() {
  const loadApiData = useApiStore((state) => state.loadApiData);
  const { sources, addSource, loadAllEnabledSources } = useApiCenterStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    // 使用 ref 防止 React Strict Mode 导致的重复执行
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 初始化默认 API 源（如果还没有）
    if (sources.length === 0) {
      console.log('📝 初始化默认 API 源...');

      // 添加默认 API 源（从 public 文件夹）
      addSource({
        name: 'Chemdah Core',
        url: '/api-default.json',
        enabled: true
      });

      addSource({
        name: 'MythicMobs',
        url: '/api-MythicMobs.json',
        enabled: true
      });

      addSource({
        name: 'Adyeshach',
        url: '/api-Adyeshach.json',
        enabled: true
      });

      addSource({
        name: 'PlaceholderAPI',
        url: '/api-PlaceholderAPI.json',
        enabled: true
      });
    }

    // 延迟一下，确保源添加完成后再加载
    setTimeout(() => {
      // 加载所有启用的 API 源
      loadAllEnabledSources().then(() => {
        // 同步到 API Store
        loadApiData();
      });
    }, 100);
  }, []);

  return <DashboardLayout />;
}
