import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  captionImageWithOpenAiCompatibleApi,
  writeImageCaptionArtifact
} from "./vision-caption.js";

async function run(): Promise<void> {
  const imagePath = resolve(process.argv[2] ?? "");
  const outputFile = resolve(process.argv[3] ?? "data/private/captions/caption.json");
  const sourceHint = relative(process.cwd(), imagePath);
  const privateRoots = ["book", "data/private", "corpus/private"].map((path) => resolve(path));

  const artifact = await captionImageWithOpenAiCompatibleApi({
    imagePath,
    sourceHint,
    baseUrl: process.env.XUAN_VISION_BASE_URL ?? "",
    apiKey: process.env.XUAN_VISION_API_KEY ?? "",
    model: process.env.XUAN_VISION_MODEL ?? "gemini-2.5-flash",
    allowRemotePrivate: process.env.XUAN_ALLOW_REMOTE_PRIVATE === "true",
    privateRoots
  });

  writeImageCaptionArtifact(artifact, outputFile);
  console.log(
    `Wrote private image caption: ${outputFile} (model=${artifact.model}, tags=${artifact.tags.length}, confidence=${artifact.trace.confidence})`
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
