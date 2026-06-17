import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CampaignFilter, CampaignSortKey, SortDir } from "../../types";

interface CampaignsUIState {
  selectedId: string | null;
  sortKey: CampaignSortKey;
  sortDir: SortDir;
  filter: CampaignFilter;
}

const initialState: CampaignsUIState = {
  selectedId: null,
  sortKey: "impressions",
  sortDir: "desc",
  filter: "all",
};

const campaignsSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    selectCampaign(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    clearSelected(state) {
      state.selectedId = null;
    },
    setSort(state, action: PayloadAction<CampaignSortKey>) {
      if (state.sortKey === action.payload) {
        state.sortDir = state.sortDir === "desc" ? "asc" : "desc";
      } else {
        state.sortKey = action.payload;
        state.sortDir = "desc";
      }
    },
    setFilter(state, action: PayloadAction<CampaignFilter>) {
      state.filter = action.payload;
    },
  },
});

export const { selectCampaign, clearSelected, setSort, setFilter } = campaignsSlice.actions;
export default campaignsSlice.reducer;
