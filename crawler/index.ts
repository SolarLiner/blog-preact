import crawlMarkdown, { MarkdownNode } from "md-crawler";
import { flow } from "fp-ts/lib/function";
import { FrontmatterT } from "./types";
import { Either, isLeft } from "fp-ts/lib/Either";
import { TypeOf } from "io-ts";

export default function crawl(root: string): Promise<Array<MarkdownNode<TypeOf<typeof FrontmatterT>>>> {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return crawlMarkdown(root, flow(FrontmatterT.decode, unwrap));
}

function unwrap<T, E>(either: Either<E, T>): T {
  if (isLeft(either)) {
    throw new Error(JSON.stringify(either.left, null, 2));
  }
  return either.right;
}
