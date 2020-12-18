import crawlMarkdown, { MarkdownNode } from "md-crawler";
import readingTime from "reading-time";
import { flow } from "fp-ts/lib/function";
import { FrontmatterDerived, FrontmatterRaw, FrontmatterT } from "./types";
import { Either, isLeft } from "fp-ts/lib/Either";
import { Errors } from "io-ts";

export default function crawl(root: string): Promise<Array<MarkdownNode<FrontmatterRaw & FrontmatterDerived>>> {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return crawlMarkdown(root, flow(FrontmatterT.decode, unwrapDecode)).then(mds => mds.map(addDerivedMetadata).sort((a, b) => b.date.valueOf() - a.date.valueOf()));
}

const unwrap = <E>(printer: (err: E) => string) => <T>(either: Either<E, T>): T => {
  if (isLeft(either)) throw new Error("Error: " + printer(either.left));
  else return either.right;
};

const unwrapDecode = unwrap((errors: Errors) => errors.map(err => {
  const ctx = err.context[err.context.length - 1];
  return `${ctx.key} should be ${ctx.type.name} but was ${ctx.actual}`;
}).join(", "));

function addDerivedMetadata(node: MarkdownNode<FrontmatterRaw>): MarkdownNode<FrontmatterRaw & FrontmatterDerived> {
  const { words, minutes } = readingTime(node.contents);
  return { ...node, readingTime: Math.ceil(minutes), words };
}
