import { apiSlice } from "../apiSlice";

export const bikeReviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateBikeReview: builder.mutation<any, { bike_name: string }>({
      query: (body) => ({
        url: 'ai-reviews/generate/',
        method: 'POST',
        body,
      }),
    }),
    getJobStatus: builder.query<any, string>({
      query: (job_id) => `ai-reviews/status/${job_id}`,
    }),
    getPopularBikes: builder.query<any, void>({
      query: () => 'ai-reviews/popular',
    }),
  }),
});

export const { useGenerateBikeReviewMutation, useGetJobStatusQuery, useGetPopularBikesQuery } = bikeReviewApi;
