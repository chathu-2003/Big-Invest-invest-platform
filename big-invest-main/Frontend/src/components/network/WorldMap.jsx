import { useCms } from '../../cms/ContentProvider';
import { mapHTML } from '../prototypeMarkup';
import { Icon } from '../common/Content';
import { Link } from 'react-router-dom';

// Trusted prototype SVG markup preserves every path, gradient, coordinate and label.
export function WorldMap({ mode, active, onSelect, ...attributes }) {
  const { data } = useCms();
  const plotted = { ...data, REGIONS: data.REGIONS.filter(r => Number.isFinite(Number(r.x)) && r.x != null && r.y != null) };
  let html = mapHTML(mode, plotted);
  if (mode === 'interactive') {
    html = html.replace(/class="route" data-region="([^"]+)"/g, (_, id) => `class="route ${id === active ? 'is-on' : 'is-dim'}" data-region="${id}"`)
      .replace(/class="node" data-region="([^"]+)"/g, (_, id) => `class="node${id === active ? ' is-on' : ''}" data-region="${id}"`)
      .replace(/data-pick-region="([^"]+)" aria-pressed="false"/g, (_, id) => `data-pick-region="${id}" aria-pressed="${id === active}"`);
  }
  return <div {...attributes} onClick={event => {
    const button = event.target.closest('[data-pick-region]');
    if (button && onSelect) onSelect(button.dataset.pickRegion);
  }} dangerouslySetInnerHTML={{ __html: html }} />;
}
export function RegionChips({ active, onSelect }) {
  const { data } = useCms();
  return data.REGIONS.map(region => <button className="chip" type="button" data-pick-region={region.id} aria-pressed={active === region.id} onClick={() => onSelect(region.id)} key={region.id}>{region.name}</button>);
}
export function RegionDetails({ active }) {
  const { data } = useCms();
  const region = data.REGIONS.find(item => item.id === active) || data.REGIONS[0];
  if (!region) return <p className="small">No regions are currently published.</p>;
  return <><span className="pill pill-dark" style={{ background: '#FFC900', color: '#102747' }}>Potential focus</span><h3 className="h3">{region.name}</h3>
    {region.image&&<img src={region.image} alt={region.name} style={{width:'100%',aspectRatio:'16 / 9',objectFit:'cover',borderRadius:12}}/>}
    <p className="small">{region.text}</p><ul className="checks">{region.items.map(item => <li key={item}><span className="tick"><Icon name="check" /></span>{item}</li>)}</ul>
    <div className="mt-8"><Link className="btn btn-primary btn-sm" to={`/contact/general/${region.id}`}>{`Discuss ${region.name}`}<Icon name="arrow-right" /></Link></div>
    <p className="small" style={{ fontSize: 12.5, marginTop: 'auto' }}>{region.disclaimer ?? 'Illustrative only — markets and partners to be confirmed by BIG INVEST.'}</p></>;
}
