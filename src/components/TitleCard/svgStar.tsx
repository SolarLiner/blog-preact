import { FunctionalComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";

interface Props {
  position: [number, number];
  radius: number;
}

function getRandomOpacity() {
  const random = Math.random();
  if (random < 0.2) return 0.85;
  else if (random < 0.95) return 1.1;
  return 1.0;
}

const SvgStar: FunctionalComponent<Props> = ({ position: [x, y], radius }) => {
  const [opacity, setOpacity] = useState(1.0);
  useEffect(() => {
    function animate() {
      requestAnimationFrame(() => setOpacity(getRandomOpacity()));
    }

    const intervalID = setInterval(animate, Math.random() * 2000 + 500);
    return () => {
      clearInterval(intervalID);
    };
  }, []);
  const r = radius * opacity;
  return (
    <rect
      x={-r / 2}
      y={-r / 2}
      width={r}
      height={r}
      transform={`translate(${x}, ${y}) rotate(45)`}
      fill={`rgba(100%, 100%, 100%, ${opacity}`}
    />
  );
};
export default SvgStar;
