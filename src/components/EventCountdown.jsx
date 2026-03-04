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
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <span className="text-xl font-black text-white tabular-nums leading-none">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] text-white/50 uppercase tracking-wider mt-1">{label}</span>
    </div>
  );

  return (
    <div
      className="relative rounded-2xl mb-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #92400e 0%, #b45309 35%, #d97706 65%, #92400e 100%)' }}
    >
      {/* Decorative orb top-right */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)' }}
      />
      {/* Decorative orb bottom-left */}
      <div
        className="absolute -bottom-8 -left-4 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)' }}
      />

      <div className="relative px-5 py-4 flex items-center justify-between gap-4">
        {/* Left — Event info */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">🎉</span>
            <span className="text-white/60 text-xs font-semibold uppercase tracking-[0.15em]">
              75th Anniversary
            </span>
            {status === 'live' && (
              <span className="animate-pulse bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                LIVE
              </span>
            )}
          </div>
          <p className="text-white font-bold text-lg leading-tight">
            Alumni Reunion
          </p>
          <p className="text-white/60 text-xs mt-0.5">
            ZPHS Valaparla · May 9–10
          </p>
        </div>

        {/* Right — Countdown */}
        {status === 'upcoming' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Unit value={timeLeft.days} label="Days" />
            <span className="text-white/25 text-sm font-light mb-3">:</span>
            <Unit value={timeLeft.hours} label="Hrs" />
            <span className="text-white/25 text-sm font-light mb-3">:</span>
            <Unit value={timeLeft.minutes} label="Min" />
            <span className="text-white/25 text-sm font-light mb-3">:</span>
            <Unit value={timeLeft.seconds} label="Sec" />
          </div>
        )}

        {status === 'live' && (
          <p className="text-white/80 text-sm shrink-0">Happening now 🎊</p>
        )}
      </div>
    </div>
  );
}
