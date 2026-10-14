import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import data from '../../data/prototype';
import { Icon } from '../common/Content';
import { fieldErrors } from '../../api/client';
import useApiSubmission from './useApiSubmission';

// Shared form exports are intentionally consumed together by the enquiry UI.
/* eslint-disable react-refresh/only-export-components */
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const labels = { name: 'Full name', email: 'Business email', phone: 'Phone', company: 'Company', type: 'Enquiry type', message: 'Message', consent: 'Consent' };
const enquiryTypes = { general: 'General business enquiry', partnership: 'Partnership enquiry', services: 'Services enquiry', 'import-export': 'Import & export assistance', sourcing: 'International sourcing', logistics: 'Logistics & supply chain', investment: 'Investment opportunities', industry: 'Industry-specific enquiry', other: 'Other' };
const emptyValues = () => ({ name: '', email: '', phone: '', company: '', type: '', message: '', consent: false });
function validate(field, value) {
  switch (field) {
    case 'name': return value.trim().length >= 2 ? '' : 'Please enter your full name.';
    case 'email': return !value.trim() ? 'Please enter your email address.' : emailPattern.test(value.trim()) ? '' : 'Please enter a valid email address, like name@company.com.';
    case 'phone': {
      if (!value.trim()) return '';
      const length = value.replace(/\D/g, '').length;
      return /^[+()\d\s-]+$/.test(value.trim()) && length >= 7 && length <= 15 ? '' : 'Please enter a valid phone number, or leave it blank.';
    }
    case 'company': return value.trim().length >= 2 ? '' : 'Please enter your company name.';
    case 'type': return value ? '' : 'Please choose an enquiry type.';
    case 'message': return value.trim().length < 20 ? 'Please add a little more detail (at least 20 characters).' : value.trim().length > 1000 ? 'Please keep your message under 1,000 characters.' : '';
    case 'consent': return value ? '' : 'Please confirm we may use your details to reply.';
    default: return '';
  }
}
export function useEnquiry() {
  const { type, topic } = useParams();
  const [preset, setPreset] = useState({ type, topic });
  const [values, setValues] = useState(() => {
    const entry = [...data.SERVICES, ...data.INDUSTRIES, ...data.REGIONS].find(item => item.id === topic);
    return { ...emptyValues(), type: enquiryTypes[type] ? type : '', message: entry ? `I would like to discuss ${entry.title || entry.name}. ` : '' };
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const api = useApiSubmission(`${type || ''}/${topic || ''}`);
  const touched = useRef(new Set());
  if (preset.type !== type || preset.topic !== topic) {
    setPreset({ type, topic });
    setSuccess(false);
    setValues(previous => {
      const entry = [...data.SERVICES, ...data.INDUSTRIES, ...data.REGIONS].find(item => item.id === topic);
      return { ...previous, type: enquiryTypes[type] ? type : previous.type, message: entry && !previous.message.trim() ? `I would like to discuss ${entry.title || entry.name}. ` : previous.message };
    });
  }
  const change = (field, value) => {
    setValues(previous => ({ ...previous, [field]: value }));
    if (errors[field]) setErrors(previous => ({ ...previous, [field]: validate(field, value) }));
  };
  const blur = field => {
    if (values[field] || touched.current.has(field)) setErrors(previous => ({ ...previous, [field]: validate(field, values[field]) }));
    touched.current.add(field);
  };
  const submit = event => {
    event.preventDefault();
    if (api.sending || api.retrySeconds) return;
    const nextErrors = Object.fromEntries(Object.keys(labels).map(field => [field, validate(field, values[field])]).filter(([, error]) => error));
    setErrors(nextErrors); setSubmitted(true);
    if (Object.keys(nextErrors).length) { requestAnimationFrame(() => document.querySelector('#form-summary .notice')?.focus()); return; }
    api.submit('/enquiries', values, {
      onSuccess: () => {
        setReceipt({ ...values }); setValues(emptyValues()); setSuccess(true);
        setErrors({}); touched.current.clear();
      },
      onError: error => {
        setErrors(fieldErrors(error, Object.keys(labels)));
        requestAnimationFrame(() => document.querySelector('#form-summary .notice')?.focus());
      },
    });
  };
  const reset = () => {
    setValues(emptyValues()); setErrors({}); setSubmitted(false); setSuccess(false); setReceipt(null); api.clearFailure(); touched.current.clear();
    requestAnimationFrame(() => document.getElementById('f-name')?.focus());
  };
  return { values, receipt, errors, sending: api.sending, failure: api.failure, retrySeconds: api.retrySeconds, submitted, success, change, blur, submit, reset };
}
export function ValidationSummary({ errors, show }) {
  const list = Object.entries(errors).filter(([, message]) => message);
  if (!show || !list.length) return null;
  return <div className="notice notice-err" tabIndex={-1}><Icon name="circle-alert" /><div><strong>Please check {list.length}{list.length === 1 ? ' field' : ' fields'}:</strong>
    <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{list.map(([field, message]) => <li key={field}><a href={`#f-${field}`} style={{ color: 'inherit' }} onClick={event => {
      event.preventDefault(); const input = document.getElementById(`f-${field}`); input?.scrollIntoView({ behavior: 'smooth', block: 'center' }); input?.focus({ preventScroll: true });
    }}>{labels[field]}</a> — {message}</li>)}</ul></div></div>;
}
export function ContactSuccess({ values, onReset }) {
  const root = useRef(null);
  useEffect(() => root.current?.focus(), []);
  return <div className="success-panel" tabIndex={-1} id="contact-success" ref={root}>
    <span className="success-icon"><Icon name="circle-check" /></span><span className="eyebrow">Enquiry received</span>
    <h2 className="h2" style={{ fontSize: 'clamp(26px,2.2vw,34px)' }}>Thank you, {values.name.trim().split(' ')[0]}.</h2>
    <p className="body">Your enquiry has been received. You provided the reply address <strong>{values.email.trim()}</strong>.</p>
    <ul className="summary-list"><li><b>Enquiry type:</b> {enquiryTypes[values.type]}</li><li><b>Company:</b> {values.company.trim()}</li><li><b>Email:</b> {values.email.trim()}</li></ul>
    <div className="notice notice-info" style={{ width: '100%' }}><Icon name="info" /><span>Your message has been stored for the BIG INVEST team to review.</span></div>
    <div className="btn-row"><button className="btn btn-navy btn-sm" type="button" data-new-enquiry onClick={onReset}>Send another enquiry</button><Link className="btn btn-outline btn-sm" to="/">Back to home</Link></div>
  </div>;
}
