import React from 'react';
import { useResortOS } from '../../../context/ResortOSContext';
import { useTheme } from '../../../context/ThemeContext';
import { Star, CheckCircle2, Gift, HeartHandshake } from 'lucide-react';

export const FeedbackModule: React.FC = () => {
  const { feedbackItems, resolveFeedback } = useResortOS();
  const { isLight } = useTheme();

  return (
    <div className={`space-y-6 ${isLight ? 'text-[#18251F]' : 'text-neutral-200'}`}>
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isLight ? 'border-[#D0CCC0]' : 'border-white/[0.08]'
        }`}
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-editorial tracking-wide">
            10. Guest Feedback & Service Quality
          </h2>
          <p className={`text-xs font-mono mt-1 ${isLight ? 'text-[#4D5C4D]' : 'text-neutral-400'}`}>
            5-STAR STAY RATINGS · DEPARTMENTAL SENTIMENT SCORING · MANAGER SERVICE RECOVERY
          </p>
        </div>

        <div className="text-xs font-mono">
          AVERAGE SCORE: <span className="font-bold text-[#8F6834] dark:text-[#c8aa6e]">4.82 / 5.0 (98% Positive)</span>
        </div>
      </div>

      <div className="space-y-4">
        {feedbackItems.map((fb) => (
          <div
            key={fb.id}
            className={`p-5 border space-y-3 transition-all ${
              isLight ? 'bg-[#EEECE4] border-[#D0CCC0]' : 'bg-white/[0.02] border-white/[0.07] hover:border-white/15'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{fb.guestName}</span>
                <span className="text-xs font-mono font-bold text-[#8F6834] dark:text-[#c8aa6e]">[{fb.roomNumber}]</span>
                <span className="text-[11px] font-mono text-neutral-500">{fb.category}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(fb.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-[#8F6834] dark:text-[#c8aa6e] fill-current" />
                  ))}
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    fb.sentiment === 'Positive'
                      ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10'
                      : 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-400/10'
                  }`}
                >
                  {fb.sentiment}
                </span>
              </div>
            </div>

            <p className={`text-xs sm:text-sm font-light italic leading-relaxed ${isLight ? 'text-[#39453F]' : 'text-neutral-300'}`}>
              &ldquo;{fb.comment}&rdquo;
            </p>

            <div className={`pt-3 border-t flex items-center justify-between text-xs font-mono ${isLight ? 'border-[#D0CCC0]' : 'border-white/[0.05]'}`}>
              <span className="text-neutral-500">Submitted {fb.date}</span>

              <div className="flex items-center gap-2">
                {fb.serviceRecoveryStatus === 'Action Pending' ? (
                  <button
                    onClick={() => resolveFeedback(fb.id)}
                    className={`px-3 py-1 font-semibold text-[11px] uppercase transition-colors flex items-center gap-1.5 cursor-pointer border ${
                      isLight
                        ? 'bg-[#18251F] text-white hover:bg-[#26332D] border-[#18251F]'
                        : 'bg-[#c8aa6e] text-black hover:bg-[#d8bc7f] border-[#c8aa6e]'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Follow up & Mark Resolved</span>
                  </button>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
