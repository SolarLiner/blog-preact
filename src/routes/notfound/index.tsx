import { h } from "preact";
import { Button, Hero } from "preact-bulma";

const Notfound = () => {

  return (
    <Hero.Hero>
      <Hero.Body>
        <h1 class="title">This page does not exist</h1>
        <h2 class="subtitle">You may have lost your way.</h2>
        <Button color="primary" href="/" icon="mdi mdi-arrow-left-box">Back home</Button>
      </Hero.Body>
    </Hero.Hero>
  );
};

export default Notfound;
