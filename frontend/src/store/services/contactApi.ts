import { apiSlice } from "../apiSlice";

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMessages: builder.query<any[], void>({
      query: () => 'contacts/',
      providesTags: ['Message'],
    }),
    sendMessage: builder.mutation<any, any>({
      query: (body) => ({
        url: 'contacts/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = contactApi;
