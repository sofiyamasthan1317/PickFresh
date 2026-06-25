import { create } from "zustand";
import { persist } from "zustand/middleware";

type SearchState = {
  term: string;
  recent: string[];
  setTerm: (term: string) => void;
  commit: (term: string) => void;
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      term: "",
      recent: ["organic tomato", "mango", "a2 milk"],
      setTerm: (term) => set({ term }),
      commit: (term) => {
        const trimmed = term.trim();
        if (!trimmed) return;
        set({ term: trimmed, recent: [trimmed, ...get().recent.filter((item) => item !== trimmed)].slice(0, 6) });
      },
    }),
    { name: "pickfresh-search" },
  ),
);
