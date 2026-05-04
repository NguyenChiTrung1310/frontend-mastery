// Shared token store shape — each mock-api file creates its own isolated instance
// so the boilerplate and solution demos never bleed into each other.

export function createTokenStore(initial = 'expired-token') {
  let accessToken = initial;
  return {
    getAccessToken: () => accessToken,
    storeAccessToken: (token: string) => {
      accessToken = token;
    },
    reset: () => {
      accessToken = initial;
    },
  };
}
