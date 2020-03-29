import { Fragment, FunctionalComponent, h } from "preact";
import { usePrerenderData } from "@preact/prerender-data-provider";
import Markdown from "../../components/Markdown";
import { FormattedCodeBlock } from "./formatted-code-block";
import { Container, Hero, Section } from "preact-bulma";
import { MarkdownNode } from "md-crawler";
import { Frontmatter } from "../../../crawler/types";

type Props = MarkdownNode<Frontmatter>;

const blogs: FunctionalComponent<Props> = props => {
  const [data, isLoading]: [Props, boolean] = usePrerenderData(props);
  if (isLoading) {
    return (
      <Fragment>
        <Hero.Hero>
          <Hero.Body>
            <h1 class="title">Loading...</h1>
          </Hero.Body>
        </Hero.Hero>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <Hero.Hero bold={true}>
          <Hero.Body>
            <Container>
              <h1 className="title">{data.blogTitle}</h1>
              <h2 className="subtitle">{data.subtitle}</h2>
              <p class="has-text-right">{data.author && (`by ${data.author}, `)}{humanReadableDate(data.date)}</p>
            </Container>
          </Hero.Body>
        </Hero.Hero>
        {getBlogBody(data)}
      </Fragment>
    );
  }
};

function CodeBlock(props) {
  const fallback = (
    <pre>
      <code>{props.children}</code>
    </pre>
  );
  if (typeof window === "undefined") {
    return fallback;
  }
  return <FormattedCodeBlock {...props} />;
}

function getBlogBody(data: Props) {
  return (
    <Section>
      <Container>
        <Markdown>{data.contents}</Markdown>
      </Container>
    </Section>
  );
}

function humanReadableDate(d: Date | string): string {
  if (typeof d === "string") d = new Date(d);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  return `${month} ${d.getDay()}, ${d.getFullYear()}`;
}

export default blogs;
