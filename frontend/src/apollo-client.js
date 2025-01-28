// src/apollo-client.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include'
});

const authLink = setContext((_, { headers }) => {
  // Get auth token from localStorage if you need it
  // const token = localStorage.getItem('token');
  
  return {
    headers: {
      ...headers,
      credentials: 'include',
      // authorization: token ? `Bearer ${token}` : "", // Uncomment if using token auth
    }
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
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    }
  }
});

export default client;