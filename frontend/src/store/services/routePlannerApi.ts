import { apiSlice } from "../apiSlice";

export const routePlannerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateRoutePlan: builder.mutation<
      any,
      {
        source: string;
        destination: string;
        transport_mode: string;
        preferences: any;
        force_refresh?: boolean;
      }
    >({
      query: (body) => ({
        url: "routes/generate/",
        method: "POST",
        body,
      }),
    }),
    getRouteJobStatus: builder.query<any, string>({
      query: (job_id) => `routes/status/${job_id}`,
    }),
    getPopularRoutes: builder.query<any, void>({
      query: () => "routes/popular",
    }),
    clearRouteCache: builder.mutation<any, string>({
      query: (route_key) => ({
        url: `routes/cache/${route_key}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGenerateRoutePlanMutation,
  useGetRouteJobStatusQuery,
  useGetPopularRoutesQuery,
  useClearRouteCacheMutation,
} = routePlannerApi;
