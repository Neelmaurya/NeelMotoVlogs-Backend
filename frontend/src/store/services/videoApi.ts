import { apiSlice } from "../apiSlice";

export const videoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVideos: builder.query<any[], void>({
      query: () => 'videos/',
      providesTags: ['Video'],
    }),
    createVideo: builder.mutation<any, any>({
      query: (body) => ({
        url: 'videos/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Video'],
    }),
  }),
});

export const { useGetVideosQuery, useCreateVideoMutation } = videoApi;
