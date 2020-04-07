import { Fragment, FunctionalComponent, h } from "preact";
import { usePrerenderData } from "@preact/prerender-data-provider";
import { Box, Button, Control, Field, Level, Section, Tag } from "preact-bulma";
import { Link } from "preact-router";
import TitleCard from "../../components/TitleCard";
import { Frontmatter } from "../../../crawler/types";

const LINKS = [
  {
    icon: "mdi mdi-github-circle",
    title: "GitHub",
    username: "@SolarLiner",
    link: "https://github.com/solarliner"
  },
  {
    icon: "mdi mdi-gitlab",
    title: "GitLab",
    username: "@SolarLiner",
    link: "https://gitlab.com/solarliner"
  },
  {
    icon: "mdi mdi-twitter",
    title: "Twitter",
    username: "@SolarLiner",
    link: "https://twitter.com/solarliner"
  } /*,
  {
    icon: "mdi mdi-music",
    title: "My music",
    username: "Refractor",
    link: "https://refractor.dj"
  }*/
];

interface Props {
  blogs: Array<Frontmatter & { url: string }>;
}

const HomeRoute: FunctionalComponent<Props> = props => {
  const [data, isLoading, error]: [Props, boolean, Error | boolean] = usePrerenderData(props);
  console.log({ data, isLoading, error });
  const blogs: Props["blogs"] = isLoading || !data ? [] : data.blogs;
  return (
    <Fragment>
      <TitleCard title={"Nathan Graule"} subtitle={"Developer, photographer, musician"}>
        <Level.Level>
          <Level.Item>
            <Field hasAddons={true}>
              {LINKS.map(({ icon, title, username, link }, i) => (
                <Control key={i}>
                  <Button size="large" color="dark" href={link}>
                    <span class="icon">
                      <i class={icon}/>
                    </span>
                  </Button>
                </Control>
              ))}
            </Field>
          </Level.Item>
        </Level.Level>
      </TitleCard>
      {(error && (
        <Fragment>
          <h1 className="title">An error occured.</h1>
          <code>{`${error}`}</code>
        </Fragment>
      )) || <Section>{getBlogListing(blogs, isLoading)}</Section>}
    </Fragment>
  );
};

export default HomeRoute;

function humanReadableTagList(tags: string[]) {
  return tags.map(tag => <Tag color="dark">{tag}</Tag>);
}

function getBlogListing(blogs: Props["blogs"], isLoading: boolean) {
  if (isLoading) {
    return (
      <Fragment>
        <h2 class="title has-text-centered" id="blogs">
          Blogs
        </h2>
        <Box>
          <p class="has-text-centered">Loading...</p>
        </Box>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <h2 class="title has-text-centered" id="blogs">
          Blogs
        </h2>
        {blogs.map(blog => (
          <Link href={blog.url}>
            <Box>
              <article>
                <h3 class="title">{blog.title}</h3>
                <div>{humanReadableTagList(blog.tags)}</div>
              </article>
            </Box>
          </Link>
        ))}
      </Fragment>
    );
  }
}
