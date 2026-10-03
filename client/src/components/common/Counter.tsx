import { useCounter } from "@/hooks/useCounter";

interface CounterProps {
  target: number;
  suffix?: string;
  className?: string;
}

const Counter = ({ target, suffix = "", className = "" }: CounterProps) => {
  const { ref, value } = useCounter(target);
  return (
    <span className={`font-num font-extrabold ${className}`}>
      <span ref={ref}>{value}</span>
      {suffix}
    </span>
  );
};

export default Counter;

