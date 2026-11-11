import { useRef, useEffect } from 'react';

export default function DigitCodeInput({ value = '', onChange, onComplete, autoFocus = true }) {
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const digits = [
    value[0] || '',
    value[1] || '',
    value[2] || '',
    value[3] || '',
  ];

  useEffect(() => {
    if (autoFocus && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleChange = (index, e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      const finalVal = newDigits.join('');
      onChange(finalVal);
      return;
    }

    if (rawVal.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = rawVal;
      const finalVal = newDigits.join('');
      onChange(finalVal);

      if (index < 3) {
        inputRefs[index + 1].current?.focus();
      }
      if (finalVal.length === 4 && onComplete) {
        onComplete(finalVal);
      }
    } else {
      const pasted = rawVal.slice(0, 4);
      onChange(pasted);
      const targetFocus = Math.min(pasted.length, 3);
      inputRefs[targetFocus].current?.focus();
      if (pasted.length === 4 && onComplete) {
        onComplete(pasted);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedData) {
      onChange(pastedData);
      const targetFocus = Math.min(pastedData.length, 3);
      inputRefs[targetFocus].current?.focus();
      if (pastedData.length === 4 && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 my-3" onPaste={handlePaste}>
      {[0, 1, 2, 3].map((index) => {
        const digit = digits[index];
        const isFilled = Boolean(digit);

        return (
          <div key={index} className="relative group">
            <input
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-16 sm:w-16 sm:h-20 text-center font-mono text-2xl sm:text-3xl font-extrabold rounded-2xl transition-all duration-200 outline-none select-all ${
                isFilled
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border-2 border-indigo-400/60 shadow-lg shadow-indigo-500/25 scale-[1.04]'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 shadow-sm'
              }`}
            />
            {!digit && (
              <span className="pointer-events-none absolute inset-x-0 bottom-3.5 mx-auto w-3 h-1 rounded-full bg-slate-300 dark:bg-white/20 transition-all group-hover:w-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}
