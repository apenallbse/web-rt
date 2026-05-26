import React, { useEffect, useState } from 'react';
import { syncService } from '../services/syncService';

export const DbSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const sync = async () => {
      try {
        await syncService.initSync();
      } catch (e) {
        console.error("Sync failed, continuing with local data", e);
      } finally {
        setIsSynced(true);
      }
    };
    sync();
  }, []);

  if (!isSynced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-sky-main border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Sinkronisasi Database...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
