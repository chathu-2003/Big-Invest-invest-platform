import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import prototype from '../data/prototype';
import { markdownBlocks } from './markdown';
const Context = createContext(null);
const staticData = Object.fromEntries(['STATS','STEPS','SOURCING_STEPS','IND_GROUPS','HUB','SOCIALS'].map(key=>[key,prototype[key]]));
export function useCms() { return useContext(Context); }
export function ContentProvider({ children }) {
  const {pathname}=useLocation();const [state,setState]=useState({data:null,error:'',loading:true});const [retry,setRetry]=useState(0);
  useEffect(()=>{
    const abort=new AbortController();let active=true;
    const load=async()=>{try{const base=import.meta.env.VITE_API_BASE_URL;if(!base)throw Error('Website content API is not configured.');const response=await fetch(base.replace(/\/$/,'')+'/content',{headers:{Accept:'application/json'},cache:'no-store',signal:abort.signal});const result=await response.json();if(!response.ok||result.success!==true)throw Error('Website content is temporarily unavailable. Please try again.');if(active)setState({data:result.data,error:'',loading:false});}catch(error){if(active&&error.name!=='AbortError')setState(s=>({...s,error:'Website content is temporarily unavailable. Please try again.',loading:false}));}};
    load();const refresh=()=>{if(document.visibilityState==='visible')load();};window.addEventListener('focus',refresh);const timer=setInterval(refresh,30000);return()=>{active=false;abort.abort();clearInterval(timer);window.removeEventListener('focus',refresh);};
  },[pathname,retry]);
  if(!state.data)return <div className="wrap section" role={state.error?'alert':'status'}><p className="body">{state.error||'Loading website content...'}</p>{state.error&&<button className="btn btn-outline btn-sm" onClick={()=>setRetry(x=>x+1)}>Try again</button>}</div>;
  const map=row=>({...row.payload,...row,record_id:row.id,id:row.slug,img:row.image||'',short:row.payload.short||row.summary||row.title,overview:row.description||'',name:row.title,label:row.title,text:row.description||'',excerpt:row.summary||'',cat:row.category?.slug,body:row.payload.body||markdownBlocks(row.description||''),points:row.payload.points||[],included:row.payload.included||[],outcomes:row.payload.outcomes||[],opps:row.payload.opps||[],services:row.payload.services||[],items:row.payload.items||[]});
  const raw=state.data;const data={...staticData,SERVICES:raw.services.map(map),INDUSTRIES:raw.industries.map(map),ARTICLES:raw.insights.map(map),REGIONS:raw.network.map(map),PARTNERS:raw.partners.map(map),CATEGORIES:[{id:'all',label:'All'},...raw.categories.map(map)]};
  const pages=Object.fromEntries(raw.pages.map(row=>[row.slug,{...row,fields:row.payload.fields}]));
  return <Context.Provider value={{data,pages}}>{state.error&&<div className="notice notice-info" role="alert">{state.error}<button className="btn btn-outline btn-sm" onClick={()=>setRetry(x=>x+1)}>Retry</button></div>}{children}</Context.Provider>;
}
