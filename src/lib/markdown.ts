import { sanitizeUrl } from './security';

/**
 * Hafif markdown → HTML dönüştürücü
 * Harici paket gerektirmez
 */
export function renderMarkdown(md: string): string {
  if (!md) return '';

  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-slate-800 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-slate-900 mt-5 mb-2 border-b border-slate-100 pb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-slate-900 mt-6 mb-2">$1</h1>')

    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-slate-700">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-primary-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

    .replace(/\$\$([\s\S]+?)\$\$/g, '<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 my-3 font-mono text-amber-800 text-sm whitespace-pre-wrap">$1</div>')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 rounded-xl p-4 my-3 text-sm overflow-x-auto font-mono whitespace-pre"><code>$2</code></pre>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary-400 bg-primary-50 pl-4 py-2 my-2 text-slate-600 italic text-sm rounded-r-lg">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="border-slate-200 my-4" />')

    .replace(/^\- \[x\] (.+)$/gm, '<li data-list="task" class="flex gap-2 text-sm py-0.5 text-slate-500 line-through"><span>✓</span><span>$1</span></li>')
    .replace(/^\- \[ \] (.+)$/gm, '<li data-list="task" class="flex gap-2 text-sm py-0.5 text-slate-700"><span class="text-slate-300">○</span><span>$1</span></li>')
    .replace(/^[\*\-] (.+)$/gm, '<li data-list="ul" class="flex gap-2 text-slate-700 text-sm py-0.5"><span class="text-primary-500 mt-1 flex-shrink-0">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li data-list="ol" class="flex gap-2 text-slate-700 text-sm py-0.5"><span class="text-primary-600 font-semibold flex-shrink-0 w-5">$1.</span><span>$2</span></li>')

    .replace(/\[(.+?)\]\((.+?)\)/g, (_m, text, href) => {
      const safeHref = sanitizeUrl(href);
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer nofollow" class="text-primary-600 underline hover:text-primary-700">${text}</a>`;
    });

  html = html
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<blockquote') || block.startsWith('<hr') || block.startsWith('<div')) return block;

      if (block.includes('<li')) {
        const isOrdered = block.includes('data-list="ol"');
        const listTag = isOrdered ? 'ol' : 'ul';
        return `<${listTag} class="space-y-0.5 my-2 pl-1">${block}</${listTag}>`;
      }

      return `<p class="text-slate-700 text-sm leading-relaxed my-1">${block.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');

  return html.replace(/ data-list="(?:ul|ol|task)"/g, '');
}
