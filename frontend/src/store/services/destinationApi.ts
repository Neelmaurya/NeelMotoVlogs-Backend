import { apiSlice } from "../apiSlice";

export const destinationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDestinations: builder.query<any[], void>({
      query: () => 'destinations/',
      providesTags: ['Destination'],
    }),
    getDestination: builder.query<any, { country?: string; state?: string; city?: string }>({
      query: ({ country, state, city }) => {
        if (city) return `destinations/cities/${city}/`;
        if (state) return `destinations/states/${state}/`;
        return `destinations/countries/${country}/`;
      },
      providesTags: ['Destination'],
    }),
  }),
});

export const { useGetDestinationsQuery, useGetDestinationQuery } = destinationApi;
