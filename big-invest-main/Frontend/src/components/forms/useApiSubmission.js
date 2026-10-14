import { useEffect, useRef, useState } from 'react';
import { postJson } from '../../api/client';

export default function useApiSubmission(context = '') {
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState('');
  const [retrySeconds, setRetrySeconds] = useState(0);
  const busy = useRef(false), retryUntil = useRef(0), active = useRef(null), mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; active.current?.abort(); };
  }, [context]);
  useEffect(() => {
    if (!retrySeconds) return;
    const timer = window.setInterval(() => setRetrySeconds(Math.max(0, Math.ceil((retryUntil.current - Date.now()) / 1000))), 250);
    return () => window.clearInterval(timer);
  }, [retrySeconds]);

  const submit = async (path, payload, { onSuccess, onError }) => {
    if (busy.current || Date.now() < retryUntil.current) return;
    busy.current = true;
    const controller = new AbortController();
    active.current = controller;
    setSending(true); setFailure('');
    try {
      const response = await postJson(path, payload, { signal: controller.signal });
      if (mounted.current && !controller.signal.aborted) onSuccess(response);
    } catch (error) {
      if (!mounted.current || controller.signal.aborted) return;
      setFailure(error.message);
      if (error.status === 429) {
        retryUntil.current = Date.now() + error.retryAfter * 1000;
        setRetrySeconds(error.retryAfter);
      }
      onError(error);
    } finally {
      busy.current = false;
      if (mounted.current) setSending(false);
    }
  };
  return { submit, sending, failure, retrySeconds, clearFailure: () => setFailure('') };
}
