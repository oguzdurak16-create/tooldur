import { getToolBySlug, tools } from '@/data/tools';
import { renderToolIllustration, toolIllustrations } from '@/lib/toolIllustrations';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return tools.flatMap(({ slug }) => [{ file: `${slug}.svg` }, { file: slug }]);
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.svg$/i, '');
  const tool = getToolBySlug(slug);
  if (!tool) return new Response('Not found', { status: 404 });

  const scene = toolIllustrations[slug];
  if (!scene) throw new Error(`Missing tool illustration: ${slug}`);

  return new Response(renderToolIllustration(tool.name, scene), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=3600',
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}
