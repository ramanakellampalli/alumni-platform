import { useState, useEffect } from 'react';

const EVENT_START = new Date('2026-05-09T00:00:00');
const EVENT_END = new Date('2026-05-10T23:59:59');

export default function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = useState('upcoming');

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

  const Unit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <span
        className="text-4xl font-black text-white tabular-nums leading-none"
        style={{ textShadow: '0 0 24px rgba(251,191,36,0.6), 0 0 48px rgba(251,191,36,0.2)' }}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1.5">{label}</span>
    </div>
  );

  return (
    /* Gradient border wrapper */
    <div
      className="relative rounded-2xl p-px mb-6"
      style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(14,165,233,0.25) 60%, rgba(251,191,36,0.2) 100%)' }}
    >
      <div className="rounded-2xl bg-gray-950 px-5 py-4 overflow-hidden relative">
        {/* Subtle inner glow top-left */}
        <div
          className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12), transparent 70%)' }}
        />

        {/* Top row: pulse dot + label + date badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-xs font-semibold text-amber-400/90 uppercase tracking-[0.18em]">
              Alumni Reunion
            </span>
          </div>
          {status === 'live' ? (
            <span className="animate-pulse bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              LIVE
            </span>
          ) : (
            <span className="text-xs text-gray-500 border border-white/10 px-2.5 py-0.5 rounded-full">
              May 9 – 10, 2026
            </span>
          )}
        </div>

        {/* Countdown numbers */}
        {status === 'upcoming' && (
          <div className="flex items-center justify-center gap-3">
            <Unit value={timeLeft.days} label="Days" />
            <span className="text-amber-400/20 text-3xl font-thin mb-4">:</span>
            <Unit value={timeLeft.hours} label="Hrs" />
            <span className="text-amber-400/20 text-3xl font-thin mb-4">:</span>
            <Unit value={timeLeft.minutes} label="Min" />
            <span className="text-amber-400/20 text-3xl font-thin mb-4">:</span>
            <Unit value={timeLeft.seconds} label="Sec" />
          </div>
        )}

        {status === 'live' && (
          <p className="text-center text-gray-300 text-sm py-1">
            The event is happening right now 🎊
          </p>
        )}

        {/* Bottom separator + day chips */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-center gap-2">
          <span className="text-xs bg-amber-400/8 text-amber-400/70 border border-amber-400/15 px-2.5 py-0.5 rounded-full">
            📅 Day 1 · May 9
          </span>
          <span className="text-white/10 text-xs">·</span>
          <span className="text-xs bg-amber-400/8 text-amber-400/70 border border-amber-400/15 px-2.5 py-0.5 rounded-full">
            📅 Day 2 · May 10
          </span>
        </div>
      </div>
    </div>
  );
}
