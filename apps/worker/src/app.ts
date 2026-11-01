import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { makeContextFactory, type AppDeps, type HonoEnv } from './context';
import { HttpError } from './lib/errors';
import { RateLimitedError } from './lib/limiter';
import { sharedMock } from './mock';
import { claudeRoutes } from './routes/claude';
import { rulesRoutes } from './routes/rules';
import { youcamRoutes } from './routes/youcam';
import { YouCamHttpError } from './youcam/client';

export const createApp = (deps: AppDeps = {}) => {
  const makeCtx = makeContextFactory(deps);
  const app = new Hono<HonoEnv>();

  app.use('/v1/*', cors());
  app.use('*', async (c, next) => {
    c.set('ctx', makeCtx(c.env, c.req.url));
    await next();
  });

  app.onError((err, c) => {
    if (err instanceof HttpError) return c.json(err.toBody(), err.status as 400);
    if (err instanceof RateLimitedError)
      return c.json({ error: { code: 'rate_limited', message: 'YouCam is busy. Try again in a minute.' } }, 429);
    if (err instanceof YouCamHttpError)
      return c.json({ error: { code: 'youcam_error', message: 'YouCam did not respond as expected. Try again.', youcamError: err.errorCode } }, 502);
    console.error('unhandled', err instanceof Error ? err.message : err);
    return c.json({ error: { code: 'internal', message: 'Something went wrong' } }, 500);
  });

  app.get('/health', (c) => {
    const { mode, catalog } = c.get('ctx');
    return c.json({ ok: true, mock: mode === 'mock', mode, catalog: { rows: catalog.products.length, verified: catalog.verifiedCount } });
  });

  app.route('/v1', youcamRoutes);
  app.route('/v1', claudeRoutes);
  app.route('/v1', rulesRoutes);

  app.use('/mock-youcam/*', async (c, next) => {
    if (c.get('ctx').mode !== 'mock' && !c.req.path.startsWith('/mock-youcam/upload/')) return c.json({ error: { code: 'not_found', message: 'mock disabled' } }, 404);
    await next();
  });
  app.route('/mock-youcam', (deps.mock ?? sharedMock).app);

  app.notFound((c) => c.json({ error: { code: 'not_found', message: 'No such route' } }, 404));
  return app;
};
