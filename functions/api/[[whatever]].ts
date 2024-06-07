import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { B2Client } from "@simple-b2-list/b2-client";

type Bindings = {
  ID: string;
  KEY: string;
  BUCKET_ID: string;
  BUCKET_NAME: string;
  SIMPLE_BLAZE_LIST_KV: KVNamespace<"rootNode">;
};

const app = new Hono<{ Bindings: Bindings }>();

const route = app
  .basePath("/api")
  .get((c) => {
    return c.text("Greet from /api", 200);
  })
  .get("/rootNode", async (c) => {
    const latest = c.req.query("latest");
    if (latest === undefined) return c.json(JSON.parse((await c.env.SIMPLE_BLAZE_LIST_KV.get("rootNode"))!), 200);

    const b2Client = await new B2Client(c.env.ID, c.env.KEY).auth();
    const files = await b2Client.list(c.env.BUCKET_ID, { listAll: true });
    const rootNode = files2RootNode(files);
    await c.env.SIMPLE_BLAZE_LIST_KV.put("rootNode", JSON.stringify(rootNode));
    return c.json(rootNode, 200);
  })
  .get("/fileNode/:name{.*}", async (c) => {
    return (await new B2Client(c.env.ID, c.env.KEY).auth()).down(c.env.BUCKET_NAME, encodeURIComponent(c.req.param("name")));
  });

export type AppType = typeof route;
export const onRequest = handle(app);

function files2RootNode(files: Awaited<ReturnType<B2Client["list"]>>) {
  type Node =
    | {
        name: string;
        upstamp: number;
        len: number;
      }
    | {
        name: string;
        children: Node[];
      };
  type FolderNode = Extract<Node, { children: Node[] }>;
  type FileNode = Exclude<Node, { children: Node[] }>;

  const rootNode: FolderNode = {
    name: "root",
    children: [],
  };

  for (const file of files) {
    let currentNode = rootNode;
    const segments = file.fileName.split("/");
    for (const [index, segment] of segments.slice(0, segments.length - 1).entries()) {
      const next = currentNode.children.find((childNode) => "children" in childNode && segment === childNode.name) as FolderNode | undefined;

      if (next === undefined) {
        for (const segment of segments.slice(index, segments.length - 1)) {
          currentNode.children.push({ name: segment, children: [] });
          currentNode = currentNode.children[currentNode.children.length - 1] as FolderNode;
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

  return rootNode as FolderNode;
}
