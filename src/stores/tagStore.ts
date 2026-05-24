// Tag store — global list of all tags, shared between asset detail and filter panel.

import { create } from 'zustand';
import type { Tag } from '../types/tag';
import { listTags, createTag, deleteTag } from '../commands/tags';

interface TagStore {
  tags: Tag[];
  loading: boolean;
  fetchTags: () => Promise<void>;
  addTag: (name: string) => Promise<Tag>;
  removeTag: (tagId: string) => Promise<void>;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  loading: false,

  fetchTags: async () => {
    set({ loading: true });
    try {
      const tags = await listTags();
      set({ tags, loading: false });
    } catch (e) {
      console.error('Failed to fetch tags:', e);
      set({ loading: false });
    }
  },

  addTag: async (name) => {
    const tag = await createTag(name);
    set(state => ({ tags: [...state.tags, tag].sort((a, b) => a.name_normalized.localeCompare(b.name_normalized)) }));
    return tag;
  },

  removeTag: async (tagId) => {
    await deleteTag(tagId);
    set(state => ({ tags: state.tags.filter(t => t.id !== tagId) }));
  },
}));
