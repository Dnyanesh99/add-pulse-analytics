import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiSlice } from "../apiSlice";
import { configureStore } from "@reduxjs/toolkit";

// Mocking the fetchBaseQuery
vi.mock("@reduxjs/toolkit/query/react", async () => {
  const actual = await vi.importActual("@reduxjs/toolkit/query/react");
  return {
    ...actual,
    fetchBaseQuery: () => vi.fn().mockResolvedValue({ data: [{ id: "1", name: "Test Campaign" }] }),
  };
});

describe("apiSlice", () => {
  beforeEach(() => {
    configureStore({
      reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    });
  });

  it("should define the expected endpoints", () => {
    expect(apiSlice.endpoints.getCampaigns).toBeDefined();
    expect(apiSlice.endpoints.updateCampaign).toBeDefined();
    expect(apiSlice.endpoints.getTimeSeries).toBeDefined();
  });
});
