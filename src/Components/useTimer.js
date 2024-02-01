import React, {useCallback,useState, useEffect} from "react"

const interval = (delay = 0) => callback =>
  useEffect(() => {
    const id = setInterval(callback, delay);

    return () => clearInterval(id);
  }, [callback]);

  const useSecondsInterval = interval(1000);
 const useTimer = ({
    initialSeconds = 0,
    initiallyRunning = false
  } = {}) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [running, setRunning] = useState(initiallyRunning);
  
    const tick = useCallback(
      () => (running ? setSeconds((seconds) => seconds + 1) : undefined),
      [running]
    );
  
    const start = () => setRunning(true);
    const pause = () => setRunning(false);
    const reset = () => setSeconds(0);
    const stop = () => {
      pause();
      reset();
    };
  
    useSecondsInterval(tick);
  
    return { pause, reset, running, seconds, start, stop };
  };

  export default useTimer;