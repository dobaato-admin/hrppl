import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000, // 1 min — avoid refetch storms while users navigate
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 10_000,
    defaultPreloadDelay: 150,
    // Keep matches in memory long enough that browser back-nav restores the
    // previous view instantly instead of showing a blank loading screen.
    defaultGcTime: 10 * 60_000,
    defaultStaleTime: 30_000,
  });

  return router;
};
