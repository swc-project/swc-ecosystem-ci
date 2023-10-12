import fs from "fs";
import path from "path";
import process from "process";
import { cac } from "cac";

import { setupEnvironment } from "./utils";
import { CommandOptions, RunOptions } from "./types";

const cli = cac();
cli
  .command(
    "[...suites]",
    "run selected suites using specified version of @swc/core",
  )
  .option("--verify", "verify checkouts by running tests", { default: false })
  .option("--release <version>", "@swc/core release to use from npm registry")
  .action(async (suites, options: CommandOptions) => {
    const { root, swcPath, workspace } = await setupEnvironment();
    const suitesToRun = getSuitesToRun(suites, root);

    const runOptions: RunOptions = {
      root,
      swcPath,
      workspace,
      release: options.release,
      verify: options.verify,
      skipGit: false,
    };
    for (const suite of suitesToRun) {
      await run(suite, runOptions);
    }
  });

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
  .option("--release <version>", "@swc/core release to use from npm registry")
  .action(async (suites, options: CommandOptions) => {
    const { root, swcPath, workspace } = await setupEnvironment();
    const suitesToRun = getSuitesToRun(suites, root);
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

function getSuitesToRun(suites: string[], root: string) {
  let suitesToRun: string[] = suites;
  const availableSuites: string[] = fs
    .readdirSync(path.join(root, "tests"))
    .filter((f: string) => !f.startsWith("_") && f.endsWith(".ts"))
    .map((f: string) => f.slice(0, -3));
  availableSuites.sort();
  if (
    suitesToRun.length === 0 ||
    (suitesToRun.length === 1 && suitesToRun[0] === "_")
  ) {
    suitesToRun = availableSuites;
  } else {
    const invalidSuites = suitesToRun.filter(
      (x) => !x.startsWith("_") && !availableSuites.includes(x),
    );
    if (invalidSuites.length) {
      console.log(`invalid suite(s): ${invalidSuites.join(", ")}`);
      console.log(`available suites: ${availableSuites.join(", ")}`);
      process.exit(1);
    }
  }
  return suitesToRun;
}
