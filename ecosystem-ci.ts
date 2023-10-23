import path from "path";
import { cac } from "cac";

import {
  enableIgnoredTest,
  getSuitesToRun,
  installSwc,
  setupEnvironment,
} from "./utils";
import { CommandOptions, RunOptions } from "./types";

const cli = cac();

cli
  .command(
    "run-suites [...suites]",
    "run single suite with pre-built @swc/core",
  )
  .option(
    "--verify",
    "verify checkout by running tests before using local swc",
    { default: false },
  )
  .option("--release <version>", "@swc/core release to use from npm registry", {
    default: "nightly",
  })
  .action(async (suites, options: CommandOptions) => {
    const { root, swcPath, workspace } = await setupEnvironment();
    const suitesToRun = getSuitesToRun(suites, root);
    await installSwc({ version: options.release });
    const runOptions: RunOptions = {
      ...options,
      root,
      swcPath,
      workspace,
    };
    for (const suite of suitesToRun) {
      await run(suite, runOptions);
    }
  });

cli
  .command("enable [suite]", "enable single test suite")
  .action(async (suite) => {
    await enableIgnoredTest(suite);
  });

// cli
//   .command(
//     "bisect [...suites]",
//     "use git bisect to find a commit in vite that broke suites",
//   )
//   .option("--good <ref>", "last known good ref, e.g. a previous tag. REQUIRED!")
//   .option("--verify", "verify checkouts by running tests", { default: false })
//   .option("--repo <repo>", "vite repository to use", {
//     default: "swc-project/swc",
//   })
//   .option("--branch <branch>", "vite branch to use", { default: "main" })
//   .option("--tag <tag>", "vite tag to use")
//   .option("--commit <commit>", "vite commit sha to use")
//   .action(async (suites, options: CommandOptions & { good: string }) => {
//     if (!options.good) {
//       console.log(
//         "you have to specify a known good version with `--good <commit|tag>`",
//       );
//       process.exit(1);
//     }
//     const { root, swcPath, workspace } = await setupEnvironment();
//     const suitesToRun = getSuitesToRun(suites, root);
//     let isFirstRun = true;
//     const { verify } = options;
//     const runSuite = async () => {
//       try {
//         await buildSwc({ verify: isFirstRun && verify });
//         for (const suite of suitesToRun) {
//           await run(suite, {
//             verify: !!(isFirstRun && verify),
//             skipGit: !isFirstRun,
//             root,
//             swcPath,
//             workspace,
//           });
//         }
//         isFirstRun = false;
//         return null;
//       } catch (e) {
//         return e;
//       }
//     };
//     await setupSwcRepo({ ...options, shallow: false });
//     const initialError = await runSuite();
//     if (initialError) {
//       await bisectSwc(options.good, runSuite);
//     } else {
//       console.log(`no errors for starting commit, cannot bisect`);
//     }
//   });
cli.help();
cli.parse();

async function run(suite: string, options: RunOptions) {
  const { test } = await import(`./tests/${suite}.ts`);
  await test({
    ...options,
    workspace: path.resolve(options.workspace, suite),
  });
}
