import { runInRepo } from "../utils";
import { RunOptions } from "../types";

export async function test(options: RunOptions) {
  await runInRepo({
    ...options,
    repo: "jantimon/css-variable",
    branch: "main",
    build: "build",
    test: ["test:swc", "test:e2e"],
  });
}
