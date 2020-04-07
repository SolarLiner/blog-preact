import { FunctionalComponent, h, toChildArray } from "preact";
import Markup from "preact-markup";
import marked from "marked";
import { highlight, languages } from "prismjs";
import "../style/highlight.sass";

const DEFAULT_PROPS: Props = {
  markdownOptions: {},
  markupOptions: {}
};

interface Props {
  markdownOptions: object;
  markupOptions: object;
  onRender?: (markup: string, renderer: MyRenderer) => void;
}

const Markdown: FunctionalComponent<Partial<Props>> = props => {
  const { markdownOptions, markupOptions, children } = Object.assign({}, DEFAULT_PROPS, props);
  const renderer = new MyRenderer();
  const markup = marked(
    toChildArray(children)[0].toString(),
    Object.assign(
      {},
      {
        renderer,
        smartLists: true,
        smartypants: true
      },
      markdownOptions
    )
  );
  if (props.onRender) props.onRender(markup, renderer);
  return h(
    Markup,
    Object.assign(
      {
        markup: `<article class="content">${markup}</article>`,
        type: "html",
        trim: false,
        wrap: false
      },
      markupOptions
    )
  );
};
export default Markdown;

export interface HeadingNode {
  level: number;
  text: string;
  anchor: string;
  children: HeadingNode[];
}

export class MyRenderer extends marked.Renderer {
  public links: Array<HeadingNode>;

  constructor() {
    super();
    this.links = [];
  }

  heading(text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, "-");
    this.insertHeadingNode({ level, text, anchor: escapedText });
    return `<h${level} class="heading-anchor" id="${escapedText}">${text}</h${level}>`;
  }

  code(text, lang) {
    console.log({ text, lang });
    const code = highlight(text, languages[lang], lang)
      .split("\n")
      .map(line => `<code class="language-${lang}">${line}</code>`)
      .join("\n");
    return `<pre class="language-${lang}">${code}</pre>`;
  }

  private insertHeadingNode(node: Omit<HeadingNode, "children">, list = this.links): void {
    if (list.length === 0) list.push({ ...node, children: [] });
    else {
      const last = list[list.length - 1];
      if (last.level < node.level) {
        this.insertHeadingNode(node, last.children);
      } else if (last.level === node.level) {
        list.push({ ...node, children: [] });
      } else {
        last.children.push({ ...node, children: [] });
      }
    }
  }
}
