import { useState, useCallback, useRef } from 'react';
import { useGenerateBikeReviewMutation } from '../store/services/bikeReviewApi';

export type ReviewStatus = 'idle' | 'cached' | 'generating' | 'completed' | 'failed';

const STEPS = [
  'Fetching bike specs and images...',
  'Searching Reddit for owner opinions...',
  'Transcribing YouTube reviews...',
  'Generating AI review...',
  'Almost done...',
];

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export function useBikeReview() {
  const [status, setStatus]       = useState<ReviewStatus>('idle');
  const [data, setData]           = useState<any>(null);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  const pollRef  = useRef<NodeJS.Timeout | null>(null);
  const stepRef  = useRef(0);

  const [generateMutation] = useGenerateBikeReviewMutation();

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startPolling = (jobId: string) => {
    stopPolling();
    stepRef.current = 0;
    setLoadingStep(STEPS[0]);

    pollRef.current = setInterval(async () => {
      // Rotate loading message
      stepRef.current = (stepRef.current + 1) % STEPS.length;
      setLoadingStep(STEPS[stepRef.current]);

      try {
        const res  = await fetch(`${BASE_URL}/ai-reviews/status/${jobId}`);
        const json = await res.json();

        if (json.status === 'completed') {
          stopPolling();
          setData(json.data);
          setStatus('completed');
        } else if (json.status === 'failed') {
          stopPolling();
          setErrorMsg(json.error || 'Generation failed');
          setStatus('failed');
        }
        // else still processing — keep polling
      } catch (_) {
        // Network hiccup — keep polling silently
      }
    }, 4000);
  };

  const generate = useCallback(async (bikeName: string) => {
    stopPolling();
    setStatus('generating');
    setData(null);
    setErrorMsg(null);
    setLoadingStep('Checking cache...');

    try {
      const res = await generateMutation({ bike_name: bikeName }).unwrap();

      if (res.status === 'cached') {
        setData(res.data);
        setStatus('cached');
        return;
      }

      if (res.status === 'generating' && res.job_id) {
        startPolling(res.job_id);
        return;
      }

      // Direct result fallback
      setData(res);
      setStatus('completed');
    } catch (e: any) {
      setErrorMsg(e?.data?.detail || 'Failed to start generation');
      setStatus('failed');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateMutation]);

  return { generate, status, data, error: errorMsg, loadingStep };
}
