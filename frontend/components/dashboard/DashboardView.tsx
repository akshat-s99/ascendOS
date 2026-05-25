'use client';

import AscendAppShell from '@/components/layouts/AscendAppShell';
import { useAscend } from '@/hooks/useAscend';

export default function DashboardView() {
  const api = useAscend();
  return <AscendAppShell api={api} />;
}
