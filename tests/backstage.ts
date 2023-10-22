import { runInRepo } from "../utils";
import { RunOptions } from "../types";

export async function test(options: RunOptions) {
  await runInRepo({
    ...options,
    repo: "backstage/backstage",
    branch: "master",
    build: "build:all",
    test: "test",
  });
}
