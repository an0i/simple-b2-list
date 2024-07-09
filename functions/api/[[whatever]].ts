import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import rootNodeRoute from './rootNode';
import fileNodeRoute from './fileNode';

export type Bindings = {
  ID: string;
  KEY: string;
  BUCKET_ID: string;
  BUCKET_NAME: string;
  SIMPLE_BLAZE_LIST_KV: KVNamespace<'rootNode'>;
};

const app = new Hono().basePath('/api');

app.get((c) => c.text('Greet from /api', 200));

app.route('/rootNode', rootNodeRoute);

app.route('/fileNode', fileNodeRoute);

export const onRequest = handle(app);
