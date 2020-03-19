import { FunctionalComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import SvgStar from "./svgStar";

interface Star {
  x: number;
  y: number;
  radius: number;
}

interface Props {
  amount: number;
  size: number;
  class?: string;
}

const SvgStars: FunctionalComponent<Props> = ({ class: klass, size, amount }) => {
  const [stars, setStars] = useState<Star[]>([]);
  useEffect(() => {
    setStars(generateStars({ amount, size }));
  }, [amount, size]);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio={"xMinYMin meet"} class={klass}>
      {stars.map(({ x, y, radius }, i) => (
        <SvgStar key={i} position={[x, y]} radius={radius}/>
      ))}
    </svg>
  );
};
export default SvgStars;

function generateStars({ amount, size }: Props) {
  const stars = new Array<Star>();

  for (let i = 0; i < amount; i++) {
    const x = randomInBounds(0, size);
    const y = randomInBounds(0, size);
    const radius = 1 + Math.random() * 2;
    stars.push({ x, y, radius });
  }
  return stars;
}

function randomInBounds(min: number, max: number) {
  const range = max - min;
  return min + Math.random() * range;
}
