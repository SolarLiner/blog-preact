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
  const [timeoutID, setTimeoutID] = useState<number | NodeJS.Timeout>(-1);
  const [opacity, setOpacity] = useState(1.0);
  useEffect(() => {
    function animate() {
      setOpacity(getRandomOpacity());
      setTimeoutID(
        setTimeout(animate, Math.random() * 1900 + 100)
      );
    }

    setTimeoutID(setTimeout(animate, Math.random() * 3000));
    return () => clearTimeout(timeoutID as NodeJS.Timeout);
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
