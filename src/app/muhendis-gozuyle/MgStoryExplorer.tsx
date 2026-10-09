'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search, Wrench } from 'lucide-react';
import { mgStories } from '@/data/mgStories';
import styles from './mg.module.css';

const categories = ['Tümü', ...Array.from(new Set(mgStories.map((story) => story.category)))];

export default function MgStoryExplorer() {
  const [category, setCategory] = useState('Tümü');
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return mgStories.filter((story) => {
      if (category !== 'Tümü' && story.category !== category) return false;
      return !q || [story.title, story.category, story.hook, story.summary].join(' ').toLocaleLowerCase('tr-TR').includes(q);
    });
  }, [category, query]);

  return (
    <>
      <div className={styles.filters}>
        <label className={styles.searchBox}>
          <Search size={18} aria-hidden="true" />
          <span className={styles.srOnly}>Teknik içeriklerde ara</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Örneğin: rulman, halat, basınç..." />
        </label>
        <div className={styles.categories} aria-label="Konu filtresi">
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={item === category} onClick={() => setCategory(item)}
              className={item === category ? styles.categoryActive : styles.categoryButton}>{item}</button>
          ))}
        </div>
      </div>
      <div className={styles.resultCount} role="status">{results.length} içerik gösteriliyor</div>
      {results.length ? (
        <div className={styles.grid}>
          {results.map((story) => (
            <article key={story.slug} className={styles.card}>
              <Link href={'/muhendis-gozuyle/' + story.slug} className={styles.cardVisual} aria-label={story.title + ' yazısını aç'}>
                <Image src={story.image} alt={story.imageAlt} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw" unoptimized />
              </Link>
              <div className={styles.cardContent}>
                <div className={styles.cardMeta}><span>{story.category}</span><span>{story.readTime}</span></div>
                <h3><Link href={'/muhendis-gozuyle/' + story.slug}>{story.title}</Link></h3>
                <p>{story.summary}</p>
                <div className={styles.cardBottom}>
                  <Link href={'/muhendis-gozuyle/' + story.slug} className={styles.readLink}>Ayrıntıyı oku <ArrowUpRight size={16} /></Link>
                  {story.relatedTools.length > 0 && <span className={styles.toolIndicator}><Wrench size={14} /> İlgili araç</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <p className={styles.noResults}>Bu arama için içerik bulunamadı. Farklı bir teknik terim deneyin.</p>}
    </>
  );
}
