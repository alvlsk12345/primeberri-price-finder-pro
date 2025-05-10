
/**
 * Конфигурация HTTP-прокси
 */
export const proxyConfig = {
  host: '45.66.248.56',
  port: 23198,
  auth: {
    username: 'kJWNiwHWd1PV',
    password: 'alexskatin'
  },
  protocol: 'http'
};

/**
 * Формирует базовую строку аутентификации для прокси
 */
export const getProxyAuthHeader = (): string => {
  const { username, password } = proxyConfig.auth;
  const credentials = `${username}:${password}`;
  return `Basic ${btoa(credentials)}`;
};

/**
 * Формирует URL для прокси-запроса
 */
export const getProxyUrl = (): string => {
  const { host, port, protocol } = proxyConfig;
  return `${protocol}://${host}:${port}`;
};
