import Auth0Provider from 'next-auth/providers/auth0';
import AzureADProvider from 'next-auth/providers/azure-ad';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { users } from 'data/users';
import paths, { apiEndpoints } from 'routes/paths';
import axiosInstance from 'services/axios/axiosInstance';

export const demoUser = {
  id: '01',
  email: 'guest@mail.com',
  name: 'Guest',
  image: users[13].avatar,
  designation: 'Merchant Captain ',
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials) {
          try {
            const res = await axiosInstance.post(apiEndpoints.login, {
              email: credentials.email,
              password: credentials.password,
            });

            return res;
          } catch (error) {
            throw new Error(error.data?.message);
          }
        }

        return null;
      },
    }),
    CredentialsProvider({
      id: 'jwt-signup',
      name: 'Jwt Signup',
      credentials: {
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials) {
          try {
            const res = await axiosInstance.post(apiEndpoints.register, {
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
            });

            return res;
          } catch (error) {
            throw new Error(error.data?.message);
          }
        }

        return null;
      },
    }),

    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: 'https://' + process.env.AUTH0_DOMAIN,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  session: {
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt(jwtParams) {
      const { token, user } = jwtParams;

      if (user) return { ...token, ...user };

      return token;
    },

    async session(sessionParams) {
      const { token, session } = sessionParams;
      session.user.id = token.id;

      if (token.user) {
        session.user = token.user;
      }
      if (token.authToken) {
        session.authToken = token.authToken;
      }
      if (!session.user) {
        session.user = demoUser;
      }

      return session;
    },
  },

  pages: {
    signIn: paths.defaultJwtLogin,
    signOut: paths.defaultLoggedOut,
  },
};
