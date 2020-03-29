import * as t from "io-ts";

interface PositiveBrand {
  readonly Positive: symbol;
}

const DateC = new t.Type<Date>(
  "DateC",
  (u): u is Date => u instanceof Date,
  (u, c) => {
    if (u instanceof Date) return t.success(u);
    return t.failure(u, c);
  },
  a => a
);
const Positive = t.brand(t.number, (n): n is t.Branded<number, PositiveBrand> => n >= 0, "Positive");
const _ft = t.type({
  title: t.string,
  subtitle: t.string,
  date: DateC,
  tags: t.array(t.string)
}, "Frontmatter (required)");
const _ftopt = t.partial({
  author: t.string,
  cover: t.string,
  series: t.interface(
    {
      part: t.intersection([t.Int, Positive]),
      prev: t.union([t.string, t.null]),
      next: t.union([t.string, t.null])
    },
    "Series"
  )
}, "Frontmatter (optional)");
export const FrontmatterT = t.intersection([_ft, _ftopt], "Frontmatter");
// Includes modifications from prerender-urls.js
export type Frontmatter = t.TypeOf<typeof FrontmatterT> & { blogTitle: string; url: string };
