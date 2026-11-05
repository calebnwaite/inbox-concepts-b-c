/* Speech: read-aloud (speechSynthesis) and dictation (simulated, or the real Web Speech API when switched on).
   Every path degrades to a silent simulation with a console warning, so the demo never gets stuck. */
(function () {
  const B = (window.B = window.B || {});
  let stopCurrent = null;

  /** Speaks text. Calls onEnd exactly once when finished, stopped, or when speech is unavailable. Returns a stop function. */
  B.speak = function (text, onEnd) {
    if (stopCurrent) stopCurrent();
    let finished = false;
    let timer = null;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      stopCurrent = null;
      if (onEnd) onEnd();
    };
    const hasSynthesis = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    if (hasSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.02;
        utterance.onend = finish;
        utterance.onerror = (event) => console.info('concept-b: speech playback reported "' + (event.error || 'unknown') + '" (browsers block speech before a tap); the reading animation continues silently');
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn('concept-b: speech playback is unavailable here; continuing silently', error);
      }
    } else {
      console.warn('concept-b: this browser has no speech synthesis; the demo continues silently');
    }
    /* Safety net: some browsers never fire the end event (or have no voice), so end after a reading-time estimate. */
    timer = setTimeout(finish, Math.max(1500, text.split(/\s+/).length * 380));
    stopCurrent = () => {
      if (hasSynthesis) { try { window.speechSynthesis.cancel(); } catch (error) { console.warn('concept-b: could not stop speech', error); } }
      finish();
    };
    return stopCurrent;
  };

  B.stopSpeaking = () => { if (stopCurrent) stopCurrent(); };

  /** Types a canned transcript out letter by letter. onDone fires after the last letter; returns a cancel function. */
  B.simulateDictation = function (text, onText, onDone) {
    let index = 0;
    let timer = setInterval(() => {
      index += 2;
      onText(text.slice(0, index));
      if (index >= text.length) { clearInterval(timer); timer = null; onDone(text); }
    }, 30);
    return () => { if (timer) clearInterval(timer); timer = null; };
  };

  /** Real speech-to-text. Falls back to the simulation (with a console warning) if unsupported or blocked. */
  B.dictate = function (fallbackText, useReal, onText, onDone) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!useReal) return B.simulateDictation(fallbackText, onText, onDone);
    let cancelFallback = null;
    const fallBack = (why) => {
      console.warn('concept-b: real speech recognition ' + why + '; using the simulated transcript instead');
      if (B.toast) B.toast('Real microphone is not available here, so the demo typed a sample reply.');
      cancelFallback = B.simulateDictation(fallbackText, onText, onDone);
    };
    if (!Recognition) { fallBack('is not supported in this browser'); return () => { if (cancelFallback) cancelFallback(); }; }
    let handled = false;
    try {
      const recognition = new Recognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map((result) => result[0].transcript).join(' ');
        onText(transcript);
        if (event.results[event.results.length - 1].isFinal) { handled = true; onDone(transcript); }
      };
      recognition.onerror = (event) => { if (!handled) { handled = true; fallBack('was blocked (' + event.error + ')'); } };
      recognition.onend = () => { if (!handled) { handled = true; fallBack('ended without a result'); } };
      recognition.start();
      return () => { handled = true; try { recognition.abort(); } catch (error) { console.warn('concept-b: could not stop the microphone', error); } if (cancelFallback) cancelFallback(); };
    } catch (error) {
      fallBack('could not start (' + error.message + ')');
      return () => { if (cancelFallback) cancelFallback(); };
    }
  };
})();
