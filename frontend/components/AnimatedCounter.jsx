import { useEffect, useState, useRef } from 'react';

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTime = useRef(null);

  useEffect(() => {
    if (value === undefined || value === null || isNaN(value)) {
      setCount(value);
      return;
    }

    const target = parseInt(value, 10);
    const startValue = countRef.current;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = timestamp - startTime.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function: easeOutQuart
      const easeAlpha = 1 - Math.pow(1 - percentage, 4);
      
      const currentCount = Math.floor(startValue + (target - startValue) * easeAlpha);
      
      setCount(currentCount);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
        countRef.current = target;
      }
    };

    startTime.current = null;
    requestAnimationFrame(animate);
  }, [value, duration]);

  if (value === undefined || value === null) return '--';

  return <span>{count}</span>;
};

export default AnimatedCounter;
