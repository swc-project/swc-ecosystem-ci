import { Octokit } from "@octokit/core";
import { getSuitesToRun } from "./ecosystem-ci";
import { setupEnvironment } from "./utils";

async function runAll() {
  const { root } = await setupEnvironment();
  const suitesToRun = getSuitesToRun([], root);

  const octokit = new Octokit({ auth: process.env.BOT_GH_TOKEN! });

  for (const testSuite of suitesToRun) {
    await octokit.request(
      "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
      {
        owner: "swc-project",
        repo: "swc-ecosystem-ci",
        workflow_id: "6597429593",
        ref: "main",
        inputs: {
          suite: testSuite,
        },
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
  }
}

runAll();
