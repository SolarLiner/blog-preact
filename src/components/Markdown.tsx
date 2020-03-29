import { FunctionalComponent, h } from "preact";
import Markup from "preact-markup";
import marked from "marked";

const DEFAULT_PROPS: Props = {
  markdownOptions: {},
  markupOptions: {}
};

interface Props {
  markdownOptions: object;
  markupOptions: object;
}

const Markdown: FunctionalComponent<Partial<Props>> = props => {
  const { markdownOptions, markupOptions, children } = Object.assign({}, DEFAULT_PROPS, props);
  const markup = marked(children, markdownOptions);
  return h(Markup, Object.assign({
    markup: `<article class="content">${markup}</article>`,
    type: "html",
    wrap: false
  }, markupOptions));
};
export default Markdown;
