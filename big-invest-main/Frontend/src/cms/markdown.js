// HTML is always treated as text. Only headings, quotes, lists and paragraphs are supported.
export function markdownBlocks(text) {
  const result=[];let lines=[];let kind='p';const flush=()=>{if(lines.length)result.push([kind,kind==='ul'?[...lines]:lines.join('\n')]);lines=[];};
  for(const line of text.split(/\r?\n/)){if(!line.trim()){flush();kind='p';continue;}const next=/^#{1,6} /.test(line)?'h':line.startsWith('> ')?'q':line.startsWith('- ')?'ul':'p';if(next!==kind||next==='h'){flush();kind=next;}lines.push(next==='h'?line.replace(/^#{1,6} /,''):next==='q'||next==='ul'?line.slice(2):line);}flush();return result;
}
