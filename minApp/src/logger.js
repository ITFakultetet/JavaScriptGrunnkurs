import pino from 'pino';
import { config } from './config.js';

// I produksjon skriver vi ren JSON – det er det loggverktøy (Loki, Elastic,
// CloudWatch) leser. Under utvikling er JSON uleselig for mennesker, så da
// bruker vi pino-pretty. Under test slår vi det av: pino-pretty starter en
// egen worker-tråd, og den holder testprosessen i live unødig.
const brukPretty = !config.erProduksjon && !config.erTest;

export const logger = pino({
  level: config.logNiva,
  base: { app: 'kontakter' },
  ...(brukPretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname,app',
          },
        },
      }
    : {}),
});

export default logger;
