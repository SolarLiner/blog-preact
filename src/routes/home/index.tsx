import { Fragment, FunctionalComponent, h } from "preact";
import { usePrerenderData } from "@preact/prerender-data-provider";
import { Box, Button, Control, Field, Level, Section, Tag } from "preact-bulma";
import { Link, RouteProps, RouterProps } from "preact-router";
import TitleCard from "../../components/TitleCard";
import { BlogData } from "../../crawler/types";

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

interface Props extends RouterProps {
  seo: { cover: string };
  data: BlogData;
}

const HomeRoute: FunctionalComponent<RouteProps<Props>> = props => {
  const [data, isLoading] = usePrerenderData(props);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blogs = isLoading ? {} : data.data;
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

function humanReadableTagList(tags: string) {
  return (tags.substr(1, tags.length - 2).split(",") || []).map(tag => <Tag color="dark">{tag}</Tag>);
}

function getBlogListing(blogs, isLoading: boolean) {
  if (isLoading) {
    return (
      <Fragment>
        <Box>
          <p class="has-text-centered">Loading...</p>
        </Box>
      </Fragment>
    );
  } else {
    console.log(blogs);
    return (
      <Fragment>
        {blogs.edges.map(blog => (
          <Link href={`/blog/${blog.id}`}>
            <Box>
              <article>
                <h2 class="title">{blog.details.title}</h2>
                <div>{humanReadableTagList(blog.details.tags)}</div>
              </article>
            </Box>
          </Link>
        ))}
      </Fragment>
    );
  }
}
