import { useState, useEffect } from 'react';

const EVENT_START = new Date('2026-05-09T00:00:00');
const EVENT_END = new Date('2026-05-10T23:59:59');

export default function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = useState('upcoming'); // 'upcoming' | 'live' | 'ended'

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      if (now >= EVENT_END) { setStatus('ended'); return; }
      if (now >= EVENT_START) { setStatus('live'); return; }
      const diff = EVENT_START - now;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, []);

  if (status === 'ended') return null;

  const CountBox = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/[0.08] border border-white/10 rounded-lg w-12 h-12 flex items-center justify-center">
        <span className="text-lg font-bold text-amber-400 tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <div className="relative rounded-xl mb-6 overflow-hidden bg-gray-900/80 backdrop-blur-xl border border-white/10">
      <div className="relative px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left — Event Info */}
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="text-lg">🎉</span>
            <span className="text-white font-semibold text-base tracking-tight">Annual Alumni Event</span>
            {status === 'live' && (
              <span className="animate-pulse bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                LIVE
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            {status === 'live'
              ? 'The event is happening right now! 🎊'
              : 'May 9 – 10, 2026  •  Mark your calendar!'}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">📅 Day 1 · May 9</span>
            <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">📅 Day 2 · May 10</span>
          </div>
        </div>

        {/* Right — Countdown */}
        {status === 'upcoming' && (
          <div className="flex items-end gap-2">
            <CountBox value={timeLeft.days} label="Days" />
            <span className="text-white/30 text-lg font-bold mb-4">:</span>
            <CountBox value={timeLeft.hours} label="Hrs" />
            <span className="text-white/30 text-lg font-bold mb-4">:</span>
            <CountBox value={timeLeft.minutes} label="Mins" />
            <span className="text-white/30 text-lg font-bold mb-4">:</span>
            <CountBox value={timeLeft.seconds} label="Secs" />
          </div>
        )}
      </div>

    </div>
  );
}
