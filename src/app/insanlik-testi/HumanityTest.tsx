'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Brain, Check, Share2, Sparkles } from 'lucide-react';
import styles from './HumanityTest.module.css';

type Trait = 'sezgi' | 'suphe' | 'empati' | 'cesaret';
type Question = {
  id: string;
  signal: string;
  prompt: string;
  options: [{ title: string; detail: string; trait: Trait }, { title: string; detail: string; trait: Trait }];
};

const questions: Question[] = [
  {
    id: 'q1', signal: 'GÜVEN', prompt: 'Hangisine daha çok inanırsın?',
    options: [
      { title: '“Trafik vardı.”', detail: 'Geç kaldığını açıklamaya çalışıyor.', trait: 'suphe' },
      { title: '“Geç çıktım, özür dilerim.”', detail: 'Bahane üretmeden sorumluluk alıyor.', trait: 'empati' },
    ],
  },
  {
    id: 'q2', signal: 'SESSİZLİK', prompt: 'Bir tartışmadan sonra hangisi sana daha doğru gelir?',
    options: [
      { title: 'Hemen konuşmak', detail: 'Belirsizliği büyümeden bitirmek.', trait: 'cesaret' },
      { title: 'Biraz beklemek', detail: 'Duyguların sakinleşmesine izin vermek.', trait: 'sezgi' },
    ],
  },
  {
    id: 'q3', signal: 'MESAJ', prompt: 'Telefonunda hangisini görmek seni daha çok gerer?',
    options: [
      { title: '“Müsait misin?”', detail: 'Konu söylenmeden gelen kısa mesaj.', trait: 'suphe' },
      { title: 'Üç cevapsız arama', detail: 'Nedenini bilmediğin aciliyet hissi.', trait: 'sezgi' },
    ],
  },
  {
    id: 'q4', signal: 'İLK İZLENİM', prompt: 'Yeni tanıştığın birinde hangisi daha güvenilir hissettirir?',
    options: [
      { title: 'Göz temasını hiç bozmaması', detail: 'Kendinden emin ve dikkatli.', trait: 'cesaret' },
      { title: 'Bazen bakışını kaçırması', detail: 'Kontrol etmeye çalışmıyor gibi.', trait: 'empati' },
    ],
  },
  {
    id: 'q5', signal: 'RİSK', prompt: 'Gece boş bir binada hangisini seçersin?',
    options: [
      { title: 'Aydınlık asansör', detail: 'Hızlı ama kapılar kapanacak.', trait: 'cesaret' },
      { title: 'Sessiz merdiven', detail: 'Daha uzun ama kontrol sende.', trait: 'suphe' },
    ],
  },
  {
    id: 'q6', signal: 'İNSAN / MAKİNE', prompt: 'Hangisi sana daha “insan” gelir?',
    options: [
      { title: 'Kusursuz anlatım', detail: 'Akıcı, net ve hiç duraksamıyor.', trait: 'suphe' },
      { title: 'Küçük bir duraksama', detail: 'Cümlesini ortada değiştiriyor.', trait: 'sezgi' },
    ],
  },
  {
    id: 'q7', signal: 'VİCDAN', prompt: 'Yerde bir cüzdan buldun. İlk hareketin ne olur?',
    options: [
      { title: 'Kimliği bulmaya çalışmak', detail: 'Sahibine doğrudan ulaşmak.', trait: 'empati' },
      { title: 'En yakın görevliye vermek', detail: 'Sorumluluğu resmî yere bırakmak.', trait: 'suphe' },
    ],
  },
  {
    id: 'q8', signal: 'HAFIZA', prompt: 'Bir insanı yıllar sonra en çok neyle hatırlarsın?',
    options: [
      { title: 'Söylediği tek bir cümle', detail: 'Kelimeler zihninde kalır.', trait: 'sezgi' },
      { title: 'Yanında nasıl hissettiğin', detail: 'Ayrıntı değil duygu kalır.', trait: 'empati' },
    ],
  },
];

const profiles: Record<Trait, { name: string; summary: string; code: string }> = {
  sezgi: { name: 'Sessiz Radar', code: 'SR-08', summary: 'Söylenenden çok söylenmeyeni okuyorsun. Kararların kanıttan önce küçük insan sinyallerine gidiyor.' },
  suphe: { name: 'Soğuk Okuyucu', code: 'SO-17', summary: 'İlk açıklamaya teslim olmuyorsun. Kontrol, tutarlılık ve açık kapı arayan bir zihnin var.' },
  empati: { name: 'Duygu Haritacısı', code: 'DH-24', summary: 'Davranışın arkasındaki niyeti ve duyguyu görmeye çalışıyorsun. İnsanları sonuçtan önce bağlamıyla okuyorsun.' },
  cesaret: { name: 'İlk Sinyalci', code: 'IS-31', summary: 'Belirsizliği uzatmak yerine hareket ediyorsun. İnsanları hızlı okuyup kararının sorumluluğunu alıyorsun.' },
};

const traitLabels: Record<Trait, string> = { sezgi: 'Sezgi', suphe: 'Şüphe', empati: 'Empati', cesaret: 'Cesaret' };
const traitMaximums: Record<Trait, number> = { sezgi: 4, suphe: 5, empati: 4, cesaret: 3 };

type Totals = Record<string, [number, number]>;

function getSessionId() {
  const existing = window.localStorage.getItem('humanity-test-session');
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem('humanity-test-session', created);
  return created;
}

export default function HumanityTest() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [totals, setTotals] = useState<Totals>({});
  const [participants, setParticipants] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetch('/api/insanlik-testi').then((response) => response.json()).then((data) => {
      setTotals(data.totals || {});
      setParticipants(data.participants || 0);
    }).catch(() => undefined);
  }, []);

  const traitScores = useMemo(() => {
    const score: Record<Trait, number> = { sezgi: 0, suphe: 0, empati: 0, cesaret: 0 };
    for (const question of questions) {
      const answer = answers[question.id];
      if (answer === 0 || answer === 1) score[question.options[answer].trait] += 1;
    }
    return score;
  }, [answers]);

  const trait = (Object.entries(traitScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'sezgi') as Trait;

  const alignment = useMemo(() => {
    let sum = 0;
    let counted = 0;
    for (const question of questions) {
      const row = totals[question.id];
      const answer = answers[question.id];
      if (!row || answer === undefined || row[0] + row[1] < 5) continue;
      sum += (row[answer] / (row[0] + row[1])) * 100;
      counted += 1;
    }
    return counted ? Math.round(sum / counted) : null;
  }, [answers, totals]);

  async function choose(answerId: number) {
    const question = questions[step];
    const nextAnswers = { ...answers, [question.id]: answerId };
    setAnswers(nextAnswers);
    if (step < questions.length - 1) {
      window.setTimeout(() => setStep((value) => value + 1), 180);
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/insanlik-testi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getSessionId(),
          votes: questions.map((item) => ({ questionId: item.id, answerId: nextAnswers[item.id] })),
        }),
      });
      const fresh = await fetch('/api/insanlik-testi').then((response) => response.json());
      setTotals(fresh.totals || {});
      setParticipants(fresh.participants || 0);
    } catch {
      // Sonuç profili bağlantı olmasa da çalışır; topluluk oranı daha sonra oluşur.
    } finally {
      setSaving(false);
      setFinished(true);
    }
  }

  async function shareResult() {
    const profile = profiles[trait];
    const text = `Benim İnsanlık Testi profilim: ${profile.name}. ${alignment !== null ? `İnsanların %${alignment}'iyle aynı sinyalleri okudum.` : 'Sen hangi profilsin?'}`;
    try {
      if (navigator.share) await navigator.share({ title: 'İnsanlık Testi', text, url: window.location.href });
      else await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // Paylaşım penceresinin kapatılması hata değildir.
    }
  }

  if (!started) {
    return (
      <main className={styles.page}>
        <section className={styles.intro}>
          <div className={styles.brand}><span>H</span> HUMAN SIGNAL LAB <b>PILOT 01</b></div>
          <div className={styles.pulse}><i /><i /><i /></div>
          <p className={styles.kicker}>YAPAY ZEKÂ İÇİN KOLAY. İNSAN İÇİN DEĞİL.</p>
          <h1>İnsanları gerçekten<br /><em>okuyabiliyor musun?</em></h1>
          <p className={styles.lead}>Sekiz kısa durumda doğru cevap yok. Yalnızca senin ilk sinyalin ve senden önce gelen insanların bıraktığı iz var.</p>
          <button className={styles.primary} onClick={() => setStarted(true)}>Teste gir <ArrowRight size={19} /></button>
          <div className={styles.introMeta}><span><b>8</b> karar</span><span><b>90</b> saniye</span><span><b>0</b> kişisel veri</span></div>
          <p className={styles.honesty}>{participants > 0 ? `${participants} gerçek pilot katılımcı` : 'İlk pilot katılımcılar aranıyor — sahte sonuç yok.'}</p>
        </section>
      </main>
    );
  }

  if (finished) {
    const profile = profiles[trait];
    return (
      <main className={styles.page}>
        <section className={styles.result}>
          <div className={styles.brand}><span>H</span> HUMAN SIGNAL LAB <b>SONUÇ</b></div>
          <div className={styles.resultCard}>
            <div className={styles.resultTop}><Sparkles size={18} /><span>İNSAN SİNYALİ PROFİLİN</span><b>{profile.code}</b></div>
            <h1>{profile.name}</h1>
            <p>{profile.summary}</p>
            <div className={styles.alignment}>
              <strong>{alignment !== null ? `%${alignment}` : `${participants}/5`}</strong>
              <span>{alignment !== null ? 'Toplulukla ortalama eşleşmen' : 'Topluluk karşılaştırması 5 gerçek katılımcıda açılır.'}</span>
            </div>
            <div className={styles.signalBars} aria-label="Kişisel sinyal dağılımın">
              {(Object.keys(traitScores) as Trait[]).map((item) => {
                const percent = Math.round((traitScores[item] / traitMaximums[item]) * 100);
                return <div key={item}><span>{traitLabels[item]}</span><i><b style={{ width: `${Math.max(percent, 4)}%` }} /></i><em>%{percent}</em></div>;
              })}
            </div>
          </div>
          <button className={styles.primary} onClick={shareResult}>{shared ? <Check size={19} /> : <Share2 size={19} />}{shared ? 'Bağlantı kopyalandı' : 'Sonucumu paylaş'}</button>
          <p className={styles.honesty}>{participants} gerçek katılımcı · Sonuçlar canlı veriden hesaplanır.</p>
        </section>
      </main>
    );
  }

  const question = questions[step];
  return (
    <main className={styles.page}>
      <section className={styles.test}>
        <div className={styles.testHead}>
          <button onClick={() => step ? setStep(step - 1) : setStarted(false)} aria-label="Geri"><ArrowLeft size={20} /></button>
          <div className={styles.progress}><i style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
          <span>{String(step + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}</span>
        </div>
        <div className={styles.questionTag}><Brain size={15} /> {question.signal}</div>
        <h1>{question.prompt}</h1>
        <div className={styles.options}>
          {question.options.map((option, index) => (
            <button key={option.title} onClick={() => choose(index)} disabled={saving} className={answers[question.id] === index ? styles.selected : ''}>
              <span>{index === 0 ? 'A' : 'B'}</span><div><strong>{option.title}</strong><p>{option.detail}</p></div><ArrowRight size={19} />
            </button>
          ))}
        </div>
        <p className={styles.microcopy}>Fazla düşünme. İlk hissettiğini seç.</p>
      </section>
    </main>
  );
}
