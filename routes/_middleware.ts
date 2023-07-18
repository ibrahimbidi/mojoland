import { MiddlewareHandlerContext } from "$fresh/server.ts";

import database from "../communication/database.ts";
import LocalChecker from "../outils/filterLocal.ts";

import Gpt from "../communication/gpt.ts";
export const handler = (_req: Request, ctx: MiddlewareHandlerContext) => {
  if (ctx.state.db) return ctx.next();
  const db = new database();
  const gpt = new Gpt();
  const filterLocal = new LocalChecker();

  ctx.state.localFilter = filterLocal;
  ctx.state.db = db;
  ctx.state.gpt = gpt;
  return ctx.next();
};
