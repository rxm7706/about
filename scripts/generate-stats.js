import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
// Import from the cloned fork's source
import statsApi from "../../github-readme-stats/api/index.js";
import topLangsApi from "../../github-readme-stats/api/top-langs.js";

const run = async (cardType, username, options = {}, outputPathValue) => {
  const handler = cardType === "stats" ? statsApi : topLangsApi;
  const query = { username, ...options };
  
  const outputPath = path.resolve(process.cwd(), outputPathValue);
  await mkdir(path.dirname(outputPath), { recursive: true });
  
  let svg = "";
  const res = {
    setHeader: () => {},
    send: (value) => {
      svg = value;
      return value;
    },
  };
  
  await handler({ query }, res);
  
  if (!svg) {
    throw new Error(`Card renderer returned empty output for ${cardType}.`);
  }
  
  await writeFile(outputPath, svg, "utf8");
  console.log(`Wrote ${outputPath}`);
};

const main = async () => {
  const username = "rxm7706";
  
  // Stats Card
  await run("stats", username, {
    show: "prs_merged,prs_merged_percentage,rank,discussions_started,discussions_answered",
    hide: "stars",
    rank_icon: "percentile",
    include_all_commits: "true",
    show_icons: "true"
  }, "generated-stats/stats.svg");
  
  // Top Languages Card
  await run("top-langs", username, {
    layout: "compact",
    langs_count: "10",
    theme: "default",
    show_icons: "true"
  }, "generated-stats/top-langs.svg");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
