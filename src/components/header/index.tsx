import { h } from "preact";
import { Navbar } from "preact-bulma";
import { useCallback, useState } from "preact/hooks";
import classNames from "classnames";

const Header = () => {
  const [isActive, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive(!isActive), [isActive]);
  const classes = classNames({"is-active": isActive});
  return (
    <Navbar.Navbar class={classes}>
      <Navbar.Brand onToggleExpand={toggleActive} active={isActive} href="/">
        solarliner.me
      </Navbar.Brand>
      <Navbar.Menu active={isActive}>
        <Navbar.Menu side="start">
          <Navbar.MenuItem href="/#blogs">Blog</Navbar.MenuItem>
        </Navbar.Menu>
        <Navbar.Menu side="end">
          <Navbar.MenuItem href="https://github.com/solarliner">GitHub</Navbar.MenuItem>
          <Navbar.MenuItem href="https://gitlab.com/solarliner">GitLab</Navbar.MenuItem>
        </Navbar.Menu>
      </Navbar.Menu>
    </Navbar.Navbar>
  );
};

export default Header;
