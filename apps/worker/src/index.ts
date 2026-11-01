import { createApp } from './app';
import { makeContextFactory } from './context';
import type { Env } from './env';
import { sweep } from './sweeper';

const app = createApp();
const makeCtx = makeContextFactory({});

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledController, env: Env, ctx: ExecutionContext) => {
    ctx.waitUntil(sweep(makeCtx(env, 'https://worker.internal/')).then(() => undefined));
  },
} satisfies ExportedHandler<Env>;
