import { Hono } from 'hono';
import { B2Client } from '@simple-b2-list/b2-client';
import type { Bindings } from './[[whatever]]';
import type { SblFolderNodeAssert } from '@simple-b2-list/types';

const app = new Hono<{ Bindings: Bindings }>();

app.get(async (c) => {
  const refresh = c.req.query('refresh');
  if (refresh === undefined) {
    const rootNodeStr = await c.env.SIMPLE_BLAZE_LIST_KV.get('rootNode');
    if (typeof rootNodeStr !== 'string')
      return c.text('/api/rootNode?refresh', 500);
    const rootNode = JSON.parse(rootNodeStr) as SblFolderNodeAssert;
    return c.json(rootNode, 200);
  }

  const b2Client = await new B2Client(c.env.ID, c.env.KEY).auth();
  const files = await b2Client.list(c.env.BUCKET_ID, { listAll: true });
  const rootNode = files2RootNode(files);

  await c.env.SIMPLE_BLAZE_LIST_KV.put('rootNode', JSON.stringify(rootNode));

  return c.json(rootNode, 200);
});

function files2RootNode(files: Awaited<ReturnType<B2Client['list']>>) {
  const rootNode: SblFolderNodeAssert = {
    name: 'root',
    children: [],
  };

  for (const file of files) {
    let currentNode = rootNode;
    const segments = file.fileName.split('/');
    for (const [index, segment] of segments
      .slice(0, segments.length - 1)
      .entries()) {
      const next = currentNode.children.find(
        (childNode) => 'children' in childNode && segment === childNode.name,
      ) as SblFolderNodeAssert | undefined;

      if (next === undefined) {
        for (const segment of segments.slice(index, segments.length - 1)) {
          currentNode.children.push({ name: segment, children: [] });
          currentNode = currentNode.children[
            currentNode.children.length - 1
          ] as SblFolderNodeAssert;
        }
        break;
      }
      currentNode = next;
    }

    currentNode.children.push({
      name: segments[segments.length - 1],
      upstamp: file.uploadTimestamp,
      len: file.contentLength,
    });
  }

  return rootNode as SblFolderNodeAssert;
}

export default app;
