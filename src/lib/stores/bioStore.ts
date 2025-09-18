// src/lib/stores/bioStore.ts
import { writable } from 'svelte/store';

export const bioStore = writable<string>('');
export const loadingStore = writable<boolean>(false);
export const errorStore = writable<string | null>(null);
