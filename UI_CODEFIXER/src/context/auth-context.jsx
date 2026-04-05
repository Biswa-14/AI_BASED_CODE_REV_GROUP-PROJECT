import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { buildApiUrl, fetchJson } from '../lib/api';

const USER_STORAGE_KEY = 'sentient-auth-user';
const TOKEN_STORAGE_KEY = 'sentient-auth-token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = readStoredUser();

    if (storedUser) {
      setUser(storedUser);
    }

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    fetchJson(
      '/auth/me/',
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      },
      'Unable to restore your saved session.',
    )
      .then((payload) => {
        persistAuth(storedToken, payload.user);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const persistAuth = (nextToken, nextUser) => {
    setUser(nextUser);
    setToken(nextToken);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const login = async ({ email, password }) => {
    const payload = await fetchJson(
      '/auth/login/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
      'Unable to reach the login service.',
    );
    persistAuth(payload.token, payload.user);
    return payload.user;
  };

  const register = async ({ name, email, password }) => {
    const payload = await fetchJson(
      '/auth/register/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      },
      'Unable to reach the registration service.',
    );
    persistAuth(payload.token, payload.user);
    return payload.user;
  };

  const logout = async () => {
    const currentToken = token ?? window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (currentToken) {
      try {
        await fetchJson('/auth/logout/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      } catch {
        // Ignore logout network errors and clear the local session anyway.
      }
    }

    clearAuth();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function readStoredUser() {
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}
