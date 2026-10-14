// Trusted local design markup; never pass visitor input here.
export default function ReferenceContent({ html }) {
  return <div className="reference-fragment" dangerouslySetInnerHTML={{ __html: html }} />;
}
