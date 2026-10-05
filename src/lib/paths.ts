const rawBase = import.meta.env.BASE_URL;
export const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
export const path = (value = '') => `${base}${value.replace(/^\/+/, '')}`;
export const absolute = (value = '') => new URL(path(value), 'https://theusmkt.github.io').href;
