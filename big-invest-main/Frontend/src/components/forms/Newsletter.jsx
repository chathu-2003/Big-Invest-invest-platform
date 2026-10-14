import { useRef, useState } from 'react';
import { Icon } from '../common/Content';
import { emailPattern } from './enquiryState';
import { fieldErrors } from '../../api/client';
import useApiSubmission from './useApiSubmission';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState(null);
  const api = useApiSubmission();
  const input = useRef(null), checkbox = useRef(null);
  const submit = event => {
    event.preventDefault();
    if (api.sending || api.retrySeconds) return;
    const value = email.trim();
    const error = !value ? 'Please enter your email address.' : !emailPattern.test(value) ? 'Please enter a valid email address, like name@company.com.' : !consent ? 'Please tick the box to agree to receive emails.' : '';
    if (error) { setMessage({ error, invalidEmail: !value || !emailPattern.test(value) }); (!value || !emailPattern.test(value) ? input : checkbox).current.focus(); return; }
    setMessage(null);
    api.submit('/newsletter/subscribe', { email: value, consent }, {
      onSuccess: () => { setMessage({ email: value }); setEmail(''); setConsent(false); },
      onError: error => {
        const errors = fieldErrors(error, ['email', 'consent']);
        setMessage({ error: Object.values(errors).join(' ') || error.message, invalidEmail: Boolean(errors.email), invalidConsent: Boolean(errors.consent) });
        if (errors.email || errors.consent) (errors.email ? input : checkbox).current.focus();
      },
    });
  };
  return <form className="stack gap-12" noValidate data-form="newsletter" aria-busy={api.sending} onSubmit={submit}>
    <div className="newsletter"><label className="sr-only" htmlFor="nl-email">Business email</label>
      <input className={`input${message?.invalidEmail ? ' is-invalid' : ''}`} id="nl-email" name="email" type="email" placeholder="you@company.com" autoComplete="email" aria-describedby="nl-msg"
        ref={input} value={email} onChange={event => setEmail(event.target.value)} aria-invalid={message?.invalidEmail || undefined} />
      <button className="btn btn-primary" type="submit" disabled={api.sending || api.retrySeconds > 0}>{api.sending ? 'Subscribing…' : 'Subscribe'}<Icon name="send" /></button></div>
    <label className="check"><input ref={checkbox} type="checkbox" name="consent" aria-describedby="nl-msg" aria-invalid={message?.invalidConsent || undefined} checked={consent} onChange={event => setConsent(event.target.checked)} /> I agree to receive emails from BIG INVEST and can unsubscribe at any time.</label>
    <div id="nl-msg" aria-live="polite">{message && <div className={`notice ${message.error ? 'notice-err' : 'notice-ok'}`}><Icon name={message.error ? 'circle-alert' : 'circle-check'} />
      <span>{(api.retrySeconds ? `Too many attempts. Please try again in ${api.retrySeconds} seconds.` : message.error) || <>Thanks! <strong>{message.email}</strong> is subscribed to the BIG INVEST newsletter.</>}</span></div>}</div>
  </form>;
}
