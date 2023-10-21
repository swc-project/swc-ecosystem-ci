import { Octokit } from "octokit";
import { getSuitesToRun } from "./ecosystem-ci";
import { setupEnvironment } from "./utils";

async function runAll() {
  const { root } = await setupEnvironment();
  const suitesToRun = getSuitesToRun([], root);

  const octokit = new Octokit({ auth: process.env.BOT_GH_TOKEN! });

  console.log(await octokit.rest.users.getAuthenticated());

  for (const testSuite of suitesToRun) {
    await octokit.rest.actions.createWorkflowDispatch({
      owner: "swc-project",
      repo: "swc-ecosystem-ci",
      workflow_id: "6597429593",
      ref: "main",
      inputs: {
        suite: testSuite,
      },
    });
  }
}

runAll();
