import { create } from 'zustand';

type DialogType = 'budget' | 'expense';
type DialogMode = 'create' | 'edit' | null;

interface DialogState {
  budget: DialogMode;
  expense: DialogMode;
  openDialog: (type: DialogType, mode: DialogMode) => void;
  closeDialog: (type: DialogType) => void;
  toggleDialog: (type: DialogType, mode: DialogMode) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  budget: null,
  expense: null,
  openDialog: (type, mode) =>
    set((state) => ({
      ...state,
      [type]: mode,
    })),
  closeDialog: (type) =>
    set((state) => ({
      ...state,
      [type]: null,
    })),
  toggleDialog: (type, mode) =>
    set((state) => ({
      ...state,
      [type]: state[type] ? null : mode,
    })),
}));
