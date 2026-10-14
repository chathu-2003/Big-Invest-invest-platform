# Frontend source audit

Inspected the active entry chain: src/main.jsx -> App.jsx -> routes/AppRoutes.jsx -> layouts/MainLayout.jsx. Existing React source and routes are unchanged.

## Implemented routes

| Route | Page / behavior |
| --- | --- |
| / | Home |
| /about | About |
| /services | Services |
| /services/:slug | ServiceDetail; missing local slug renders NotFound |
| /industries | Industries; local group filters |
| /industries/:slug | IndustryDetail; missing local slug renders NotFound |
| /global-network | GlobalNetwork |
| /global-network/:section | Same page; section navigation |
| /insights | Insights; local search, categories, featured article |
| /insights/newsletter | Insights newsletter section |
| /insights/category/:category | Insights with category preset |
| /insights/:slug | ArticleDetail; missing local slug renders NotFound |
| /contact | Contact / shared enquiry form |
| /contact/:type | Contact with enquiry type preset |
| /contact/:type/:topic | Contact with local service/industry/region message preset |
| /index.html | Redirect to / |
| * | NotFound |

main.jsx and LegacyHashRouting.jsx preserve original #/ links. Privacy and terms are placeholder modals, not routes. Social links also show placeholder behavior.

## Forms

EnquiryForm.jsx and enquiryState.jsx implement name, email, optional phone, company, type, message and consent. Name/company have a trimmed minimum of two characters; phone permits +, parentheses, digits, spaces and hyphens with 7-15 digits; message has 20-1000 trimmed characters. Types: general, partnership, services, import-export, sourcing, logistics, investment, industry, other. Submission only sets a 900 ms timer and displays a prototype confirmation. No persistence, network request or email delivery exists. URL topic is used to prefill message text; it is not a separate form field.

Newsletter.jsx on Insights accepts email and explicit consent, validates locally and displays a prototype message. It does not subscribe anyone. Insights search is a local filter, not a submission API.

## Local content and structures

src/data/prototype.js is the active shared content source. services.js, industries.js, articles.js and network.js re-export its collections. images.js maps image keys to local public assets. src/content contains original HTML/data/runtime material; the active React routes must be used to determine behavior rather than assuming every legacy runtime feature is active.

- Eight services: global-trade, import-export, logistics, sourcing, consulting, investment, partnerships, market-entry. Fields: id (route slug), title, icon, img, optional imgPos, type, short, points[], overview, included[], outcomes[[title,text]].
- Seven industries: pharmaceuticals, medical-equipment, cosmetics, apparel, commodities, industrial, additional. Fields: id, title, short, tagline, icon, img, optional plain, group, overview, opps[[title,text]], services[service slug], note. Four actual groups plus synthetic all filter.
- Seven articles: five-questions-new-market, incoterms-plain-language, resilient-supply-chain, lasting-partnerships, investment-ready, sea-or-air-freight, first-time-importers. Fields: id, cat, img, read, title, excerpt, body. Five actual categories plus synthetic all filter. First article is featured; filtering uses title, excerpt and category label. No remote publication workflow exists.
- Eight network regions: europe, middle-east, east-asia, southeast-asia, oceania, africa, north-america, south-america. Fields: id, name, x, y, d, text, items. HUB has x/y coordinates for the Sri Lanka hub. Coordinates/path strings support SVG rendering, not live tracking. Region selection uses React state.
- STATS (four display claims), STEPS and SOURCING_STEPS (four steps each), SOCIALS (four labels/icons). These are display content, not operational records.

Network connections are explicitly illustrative, not confirmed offices or lanes. Partner names/logos are pending confirmation. Phone, email, office address, hours and map embedding are placeholders; only Colombo, Sri Lanka is displayed as location. Legal text is pending client review.

## API integrations and backend needs

Axios is declared in package.json, but source search found no Axios use, fetch calls, API client or Vite API proxy. Enquiry persistence and newsletter persistence require backend support when implemented. Email delivery requires confirmed recipients/provider configuration. Current static content, local search, map selection, section navigation and legal/social modals do not require a database to function. Content APIs are an optional later migration of existing collections, not a reason to introduce trading, payment, investment execution, shipment tracking or customer accounts.
