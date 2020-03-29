import { h } from "preact";

import Code from "preact-prism";
import "../../style/highlight.sass";

export function FormattedCodeBlock(props) {
  return <Code language={props.class}>{props.children}</Code>;
}
