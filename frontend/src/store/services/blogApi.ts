import { apiSlice } from "../apiSlice";

export const blogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<any[], void>({
      query: () => 'blogs/',
      providesTags: ['Blog'],
    }),
    getBlog: builder.query<any, string>({
      query: (slug) => `blogs/${slug}/`,
      providesTags: (result, error, slug) => [{ type: 'Blog', id: slug }],
    }),
    createBlog: builder.mutation<any, any>({
      query: (body) => ({
        url: 'blogs/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Blog'],
    }),
  }),
});

export const { 
  useGetBlogsQuery, 
  useGetBlogQuery, 
  useCreateBlogMutation 
} = blogApi;
