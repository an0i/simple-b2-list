import { Hono } from "hono";
import { B2Client } from "@simple-b2-list/b2-client";
import type { Bindings } from "./[[whatever]]";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/:name{.*}", async (c) => {
  const b2Client = await new B2Client(c.env.ID, c.env.KEY).auth();
  const bucketName = c.env.BUCKET_NAME;
  const encodedFileName = encodeURIComponent(c.req.param("name"));
  return b2Client.down(bucketName, encodedFileName);
});

export default app;
