// src/apollo-client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
  fetchOptions: {
    mode: 'cors',
  }
});

const authLink = setContext((_, { headers }) => {
  // Get auth token from localStorage if you need it
  // const token = localStorage.getItem('token');
  
  return {
    headers: {
      ...headers,
      credentials: 'include',
      // authorization: token ? `Bearer ${token}` : "", // Uncomment if using token auth
    },
    credentials: 'include'  // Add this line to ensure credentials are sent
  };
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        feed: {
          keyArgs: ['filter'],
          merge(existing = { posts: [] }, incoming, { args }) {
            if (args?.pagination?.cursor === undefined) {
              return incoming;
            }

            return {
              ...incoming,
              posts: [...existing.posts, ...incoming.posts]
            };
          }
        },
        userPosts: {
          keyArgs: ['userId', 'filter'],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          }
        }
      }
    },
    Post: {
      fields: {
        metrics: {
          merge: true,
        }
      }
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  credentials: 'include',  // Add this line
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',  // Add this to ensure fresh data
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
});

export default client;