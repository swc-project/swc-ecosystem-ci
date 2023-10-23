import { runInRepo } from "../utils";
import { RunOptions } from "../types";

export async function test(options: RunOptions) {
  await runInRepo({
    ...options,
    repo: "nextauthjs/next-auth",
    branch: "main",
    build: "build",
    test: "test",
    shallow: false,
  });
}
