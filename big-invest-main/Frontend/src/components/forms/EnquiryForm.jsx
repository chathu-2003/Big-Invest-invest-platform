import { Icon } from '../common/Content';
import { ContactSuccess, ValidationSummary, useEnquiry } from './enquiryState';
export default function EnquiryForm() {
const { values, receipt, errors, sending, failure, retrySeconds, submitted, success, change, blur, submit, reset } = useEnquiry();
if (success) return <ContactSuccess values={receipt} onReset={reset} />;
return (<form noValidate={true} data-form="contact" aria-labelledby="contact-form-title" aria-busy={sending} onSubmit={submit}>

<div className="stack gap-12">

<span className="eyebrow">
{"Business Enquiry"}
</span>
<h2 id="contact-form-title" className="h2" style={{"fontSize":"clamp(26px,2.2vw,34px)"}}>
{"Send us a message"}
</h2>
<p className="small">
{"Fields marked "}<span className="req">
{"*"}
</span>{" are required."}
</p>

</div>
<div id="form-summary" className="mt-16" aria-live="assertive">
<ValidationSummary errors={errors} show={submitted} />
{failure && <div className="notice notice-err" tabIndex={-1}><Icon name="circle-alert" /><span>{retrySeconds ? `Too many attempts. Please try again in ${retrySeconds} seconds.` : failure}</span></div>}
</div>
<div className="form-grid mt-24">

<div className="field">

<label className="label" htmlFor="f-name">
{"Full name "}<span className="req" aria-hidden="true">
{"*"}
</span>
</label>
<input className={"input" + (errors.name ? ' is-invalid' : '')} id="f-name" name="name" type="text" autoComplete="name" aria-required="true" aria-describedby="e-name" value={values.name} onChange={event => change("name", event.target.value)} onBlur={() => blur("name")} aria-invalid={errors.name ? true : undefined} />
<span className="err" id="e-name" hidden={!errors.name}>
<Icon name="circle-alert" />{errors.name}
</span>

</div>
<div className="field">

<label className="label" htmlFor="f-email">
{"Business email "}<span className="req" aria-hidden="true">
{"*"}
</span>
</label>
<input className={"input" + (errors.email ? ' is-invalid' : '')} id="f-email" name="email" type="email" autoComplete="email" aria-required="true" aria-describedby="e-email" value={values.email} onChange={event => change("email", event.target.value)} onBlur={() => blur("email")} aria-invalid={errors.email ? true : undefined} />
<span className="err" id="e-email" hidden={!errors.email}>
<Icon name="circle-alert" />{errors.email}
</span>

</div>
<div className="field">

<label className="label" htmlFor="f-phone">
{"Phone "}<span className="hint">
{"(optional)"}
</span>
</label>
<input className={"input" + (errors.phone ? ' is-invalid' : '')} id="f-phone" name="phone" type="tel" autoComplete="tel" placeholder="+94" aria-describedby="e-phone" value={values.phone} onChange={event => change("phone", event.target.value)} onBlur={() => blur("phone")} aria-invalid={errors.phone ? true : undefined} />
<span className="err" id="e-phone" hidden={!errors.phone}>
<Icon name="circle-alert" />{errors.phone}
</span>

</div>
<div className="field">

<label className="label" htmlFor="f-company">
{"Company "}<span className="req" aria-hidden="true">
{"*"}
</span>
</label>
<input className={"input" + (errors.company ? ' is-invalid' : '')} id="f-company" name="company" type="text" autoComplete="organization" aria-required="true" aria-describedby="e-company" value={values.company} onChange={event => change("company", event.target.value)} onBlur={() => blur("company")} aria-invalid={errors.company ? true : undefined} />
<span className="err" id="e-company" hidden={!errors.company}>
<Icon name="circle-alert" />{errors.company}
</span>

</div>
<div className="field span-2">

<label className="label" htmlFor="f-type">
{"Enquiry type "}<span className="req" aria-hidden="true">
{"*"}
</span>
</label>
<div className="select-wrap">

<select className={"input" + (errors.type ? ' is-invalid' : '')} id="f-type" name="type" aria-required="true" aria-describedby="e-type" value={values.type} onChange={event => change("type", event.target.value)} onBlur={() => blur("type")} aria-invalid={errors.type ? true : undefined}>

<option value="">
{"Select an enquiry type"}
</option>
<option value="general">
{"General business enquiry"}
</option>
<option value="partnership">
{"Partnership enquiry"}
</option>
<option value="services">
{"Services enquiry"}
</option>
<option value="import-export">
{"Import & export assistance"}
</option>
<option value="sourcing">
{"International sourcing"}
</option>
<option value="logistics">
{"Logistics & supply chain"}
</option>
<option value="investment">
{"Investment opportunities"}
</option>
<option value="industry">
{"Industry-specific enquiry"}
</option>
<option value="other">
{"Other"}
</option>

</select>
<svg className="i" aria-hidden="true">
<use href="#i-chevron-down">

</use>
</svg>

</div>
<span className="err" id="e-type" hidden={!errors.type}>
<Icon name="circle-alert" />{errors.type}
</span>

</div>
<div className="field span-2">

<label className="label" htmlFor="f-message">
{"Message "}<span className="req" aria-hidden="true">
{"*"}
</span>
</label>
<textarea className={"input" + (errors.message ? ' is-invalid' : '')} id="f-message" name="message" rows="6" aria-required="true" aria-describedby="e-message m-count" placeholder="Tell us about your products, markets, timelines or questions" value={values.message} onChange={event => change("message", event.target.value)} onBlur={() => blur("message")} aria-invalid={errors.message ? true : undefined}>

</textarea>
<div className="row" style={{"justifyContent":"space-between","gap":"12px"}}>

<span className="err" id="e-message" hidden={!errors.message}>
<Icon name="circle-alert" />{errors.message}
</span>
<span className="hint" id="m-count" style={{"marginLeft":"auto"}}>
{values.message.length + " / 1000"}
</span>

</div>

</div>
<div className="field span-2">

<label className="check">
<input id="f-consent" name="consent" type="checkbox" aria-describedby="e-consent" checked={values.consent} onChange={event => change("consent", event.target.checked)} onBlur={() => blur("consent")} aria-invalid={errors.consent ? true : undefined} />{" I agree that BIG INVEST may use these details to respond to my enquiry. "}<span className="req" aria-hidden="true">
{"*"}
</span>
</label>
<span className="err" id="e-consent" hidden={!errors.consent}>
<Icon name="circle-alert" />{errors.consent}
</span>

</div>

</div>
<div className="btn-row mt-24" style={{"justifyContent":"space-between"}}>

<p className="small" style={{"maxWidth":"420px"}}>
<svg className="i i-sm" aria-hidden="true" style={{"display":"inline-block","verticalAlign":"-3px","marginRight":"6px"}}>
<use href="#i-info">

</use>
</svg>{"Your details will be used to respond to your enquiry."}
</p>
<button className="btn btn-primary" type="submit" disabled={sending || retrySeconds > 0}>
{sending ? "Sending…" : <>Send Enquiry<Icon name="send" /></>}
</button>

</div>

</form>);
}
