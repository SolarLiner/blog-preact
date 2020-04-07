import crawlMarkdown, { MarkdownNode } from "md-crawler";
import readingTime from "reading-time";
import { flow } from "fp-ts/lib/function";
import { FrontmatterDerived, FrontmatterRaw, FrontmatterT } from "./types";
import { Either, isLeft } from "fp-ts/lib/Either";

export default function crawl(root: string): Promise<Array<MarkdownNode<FrontmatterRaw & FrontmatterDerived>>> {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return crawlMarkdown(root, flow(FrontmatterT.decode, unwrap)).then(mds => mds.map(addDerivedMetadata));
}

function unwrap<T, E>(either: Either<E, T>): T {
  if (isLeft(either)) {
    throw new Error(JSON.stringify(either.left, null, 2));
  }
  return either.right;
}

function addDerivedMetadata(node: MarkdownNode<FrontmatterRaw>): MarkdownNode<FrontmatterRaw & FrontmatterDerived> {
  const { words, minutes } = readingTime(node.contents);
  return { ...node, readingTime: Math.ceil(minutes), words };
}
