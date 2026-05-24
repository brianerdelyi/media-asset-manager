import { create } from 'zustand';
import type { Drive } from '../types/drive';
import { listDrives, registerDrive, previewRemoveDrive, confirmRemoveDrive, renameDrive } from '../commands/drives';

interface DriveStore {
  drives: Drive[];
  loading: boolean;
  error: string | null;
  fetchDrives: () => Promise<void>;
  addDrive: (path: string, friendlyName: string) => Promise<Drive>;
  removeDrive: (driveId: string, deleteOrphaned: boolean) => Promise<void>;
  renameDrive: (driveId: string, friendlyName: string) => Promise<void>;
  setDriveOnline: (driveId: string, isOnline: boolean) => void;
  previewRemove: (driveId: string) => Promise<{ orphaned: number; affected: number }>;
}

export const useDriveStore = create<DriveStore>((set) => ({
  drives: [],
  loading: false,
  error: null,

  fetchDrives: async () => {
    set({ loading: true, error: null });
    try {
      const drives = await listDrives();
      set({ drives, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  addDrive: async (path, friendlyName) => {
    const drive = await registerDrive(path, friendlyName);
    set(state => ({ drives: [...state.drives, drive] }));
    return drive;
  },

  removeDrive: async (driveId, deleteOrphaned) => {
    await confirmRemoveDrive(driveId, deleteOrphaned);
    set(state => ({ drives: state.drives.filter(d => d.id !== driveId) }));
  },

  renameDrive: async (driveId, friendlyName) => {
    const updated = await renameDrive(driveId, friendlyName);
    set(state => ({ drives: state.drives.map(d => d.id === driveId ? updated : d) }));
  },

  setDriveOnline: (driveId, isOnline) => {
    set(state => ({ drives: state.drives.map(d => d.id === driveId ? { ...d, is_online: isOnline } : d) }));
  },

  previewRemove: async (driveId) => {
    const preview = await previewRemoveDrive(driveId);
    return { orphaned: preview.orphaned_asset_count, affected: preview.affected_asset_count };
  },
}));
