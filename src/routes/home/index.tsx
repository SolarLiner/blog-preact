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
  const [data, isLoading]: [Props, boolean] = usePrerenderData(props);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blogs: Props["blogs"] = isLoading ? [] : data.blogs;
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
      <Section id="blogs">{getBlogListing(blogs, isLoading)}</Section>
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
        <Box>
          <p class="has-text-centered">Loading...</p>
        </Box>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        {blogs.map(blog => (
          <Link href={blog.url}>
            <Box>
              <article>
                <h2 class="title">{blog.title}</h2>
                <div>{humanReadableTagList(blog.tags)}</div>
              </article>
            </Box>
          </Link>
        ))}
      </Fragment>
    );
  }
}
