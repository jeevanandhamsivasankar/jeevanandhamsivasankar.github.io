import { useState, useEffect, useRef } from "react";

export function useTypewriter(
  words,
  {
    speed = 65,
    deleteSpeed = 35,
    pause = 1800,
    jitter = 30,
    startDelay = 900,
    nextWordDelay = 300,
    rng = Math.random,
    enabled = true,
  } = {},
) {
  const [display, setDisplay] = useState("");
  const cursor = useRef({ wi: 0, ci: 0, deleting: false });

  useEffect(() => {
    if (!enabled || !words || words.length === 0) return undefined;
    const c = cursor.current;
    let t;
    const tick = () => {
      const word = words[c.wi];
      if (!c.deleting) {
        if (c.ci < word.length) {
          setDisplay(word.slice(0, c.ci + 1));
          c.ci++;
          t = setTimeout(tick, speed + rng() * jitter);
        } else {
          t = setTimeout(() => {
            c.deleting = true;
            tick();
          }, pause);
        }
      } else if (c.ci > 0) {
        setDisplay(word.slice(0, c.ci - 1));
        c.ci--;
        t = setTimeout(tick, deleteSpeed);
      } else {
        c.wi = (c.wi + 1) % words.length;
        c.deleting = false;
        t = setTimeout(tick, nextWordDelay);
      }
    };
    t = setTimeout(tick, startDelay);
    return () => clearTimeout(t);
  }, [words, speed, deleteSpeed, pause, jitter, startDelay, nextWordDelay, rng, enabled]);

  if (!words || words.length === 0) return "";
  return enabled ? display : words[0];
}
