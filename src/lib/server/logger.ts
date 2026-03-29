import pino from 'pino';

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const log = pino({
    level,
    base: { app: 'kontaktformular' }
});
