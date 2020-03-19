import { FunctionalComponent, h } from "preact";
import { Container, Hero, Level } from "preact-bulma";
import SvgStars from "./svgStars";
import { Link } from "preact-router";

import "./styles.sass";

interface Props {
  title: string;
  subtitle: string;
}

const TitleCard: FunctionalComponent<Props> = ({ title, subtitle, children }) => (
  <Hero.Hero bold={true} size="large">
    <div class="titlecard--svg-container">
      <SvgStars class="titlecard--svg" amount={100} size={1000}/>
    </div>
    <Hero.Body class="titlecard--svg-raise">
      <Container class="has-text-centered">
        <h1 class="title is-1">{title}</h1>
        <h2 class="subtitle is-5">{subtitle}</h2>
        {children}
      </Container>
    </Hero.Body>
    <Hero.Footer>
      <Level.Level>
        <Level.Item>
          <Link href="#blog">Blog</Link>
        </Level.Item>
        <Level.Item>
          <Link href="/contact">Contact</Link>
        </Level.Item>
      </Level.Level>
    </Hero.Footer>
  </Hero.Hero>
);
export default TitleCard;
