import { Fragment, FunctionalComponent, h } from "preact";
import { usePrerenderData } from "@preact/prerender-data-provider";
import Markdown, { HeadingNode, MyRenderer } from "../../components/Markdown";
import { FormattedCodeBlock } from "./formatted-code-block";
import { Container, Hero, Menu, Section } from "preact-bulma";
import { MarkdownNode } from "md-crawler";
import { Frontmatter } from "../../../crawler/types";
import { useCallback, useState } from "preact/hooks";

type Props = MarkdownNode<Frontmatter>;

const blogs: FunctionalComponent<Props> = props => {
  const [data, isLoading]: [Props, boolean] = usePrerenderData(props);
  if (isLoading) {
    return (
      <Fragment>
        <Hero.Hero color="dark">
          <Hero.Body>
            <h1 class="title">Loading...</h1>
          </Hero.Body>
        </Hero.Hero>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <Hero.Hero bold={true} color="dark">
          <Hero.Body>
            <Container>
              <h1 className="title">{data.blogTitle}</h1>
              <h2 className="subtitle">{data.subtitle}</h2>
              <p class="has-text-right">
                {data.words} words ({data.readingTime} minute{data.readingTime === 1 ? "" : "s"} reading time);&nbsp;
                {data.author && `by ${data.author}, `}
                {humanReadableDate(data.date)}
              </p>
            </Container>
          </Hero.Body>
        </Hero.Hero>
        {getBlogBody(data)}
      </Fragment>
    );
  }
};

function Code(props) {
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
  const [links, setLinks] = useState([]);
  const renderCB = useCallback((_, renderer: MyRenderer) => {
    const newlinks = renderer.links;
    console.log("Got links", newlinks);
    if (!jsonifyEquals(newlinks, links))
      setLinks(newlinks);
  }, [links]);
  return (
    <Section>
      <div class="columns">
        <div class="column is-2">
          <Container class="container-fixed">
            <Menu.Menu>
              <Menu.Label>Table of contents</Menu.Label>
              <Menu.List>{renderLinks(links)}</Menu.List>
            </Menu.Menu>
          </Container>
        </div>
        <div class="column is-10">
          <Container>
            <Markdown markupOptions={{ components: { Img } }} onRender={renderCB}>
              {data.contents}
            </Markdown>
          </Container>
        </div>
      </div>
    </Section>
  );
}

function Img({ src, alt }) {
  return <img class="image" src={src} alt={alt}/>;
}

function humanReadableDate(d: Date | string): string {
  if (typeof d === "string") d = new Date(d);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  return `${month} ${d.getDay()}, ${d.getFullYear()}`;
}

function renderLinks(links: HeadingNode[]) {
  return links.map(link =>
    link.children.length > 0 ? (
      <Menu.Item href={"#" + link.anchor}>{link.text}</Menu.Item>
    ) : (
      <Menu.SubList title={link.text} href={"#" + link.anchor}>
        {renderLinks(link.children)}
      </Menu.SubList>
    )
  );
}

export default blogs;

function jsonifyEquals<A>(a: A, b: A): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
