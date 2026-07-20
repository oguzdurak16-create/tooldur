'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookmarkPlus, Clipboard, FileDown, FolderPlus, History, Lock, Share2, CheckCircle2 } from 'lucide-react';
import type { Tool } from '@/data/tools';
import { getCategoryById } from '@/data/tools';
import { supabase } from '@/lib/supabase';
import type { Locale } from '@/lib/siteLanguage';
import { getLocalizedPath } from '@/lib/siteLanguage';
import { getLocalizedCategoryById } from '@/lib/toolLocalization';

interface Props { tool: Tool; locale?: Locale; }

const copy: Record<Locale, {
  added: string; loginRequired: string; saveError: string; saved: string; projectReady: string; noteCopied: string; promptCopy: string; aria: string; kicker: string; title: string; text: string; historyTitle: string; historySub: string; projectTitle: string; projectSub: string; pdfTitle: string; pdfSub: string; myHistoryTitle: string; myHistorySub: string; noteTitle: string; noteSub: string; shareTitle: string; shareSub: string; defaultNote: string; category: string; description: string; source: string; pageSave: string; general: string; defaultDescription: string;
}> = {
  tr: { added: 'sayfası çalışma alanına eklendi.', loginRequired: 'Kaydetmek için önce giriş yapmalısın.', saveError: 'Kayıt tablosu hazır değil veya yetki eksik.', saved: 'Araç geçmişine kaydedildi.', projectReady: 'Proje notu hazırlandı. Proje yönetimine yönlendiriliyorsun.', noteCopied: 'Teknik not kopyalandı.', promptCopy: 'Teknik notu kopyala:', aria: 'Araç çalışma alanı', kicker: 'Üyelikli çalışma alanı', title: 'Hesabı kaydet, projeye bağla, teknik çıktı al', text: 'Tooldur araçlarını tek kullanımlık hesaplama ekranı olarak bırakma. Giriş yaptığında kullandığın araçları geçmişe kaydedebilir, proje yönetimine not olarak aktarabilir ve PDF çıktısı alabilirsin.', historyTitle: 'Geçmişe kaydet', historySub: 'Üyelikle hesap kaydı', projectTitle: 'Projeye kaydet', projectSub: 'Proje yönetimine aktar', pdfTitle: 'PDF / yazdır', pdfSub: 'Teknik çıktı al', myHistoryTitle: 'Geçmişim', myHistorySub: 'Kayıtlı hesapları aç', noteTitle: 'Teknik not kopyala', noteSub: 'Çizim veya rapora ekle', shareTitle: 'Paylaş', shareSub: 'Link veya sistem paylaşımı', defaultNote: 'Sonuçların proje kayıtlarıyla birlikte kullanılabilmesi için giriş yapman gerekir.', category: 'Kategori', description: 'Açıklama', source: 'Araç sayfası', pageSave: 'Sayfa kaydı', general: 'Genel', defaultDescription: 'Tooldur hesaplama aracı.' },
  en: { added: 'page was added to the workspace.', loginRequired: 'Sign in before saving.', saveError: 'The history table is not ready or permission is missing.', saved: 'Tool saved to history.', projectReady: 'Project note is ready. Redirecting to project management.', noteCopied: 'Technical note copied.', promptCopy: 'Copy technical note:', aria: 'Tool workspace', kicker: 'Member workspace', title: 'Save the calculation, connect it to a project, export technical output', text: 'When signed in, you can save used tools to history, send them as notes to project management and print a PDF output.', historyTitle: 'Save to history', historySub: 'Member calculation record', projectTitle: 'Save to project', projectSub: 'Send to project management', pdfTitle: 'PDF / print', pdfSub: 'Create technical output', myHistoryTitle: 'My history', myHistorySub: 'Open saved calculations', noteTitle: 'Copy technical note', noteSub: 'Add to drawing or report', shareTitle: 'Share', shareSub: 'Link or system sharing', defaultNote: 'Sign in to use results with project records.', category: 'Category', description: 'Description', source: 'Tool page', pageSave: 'Page record', general: 'General', defaultDescription: 'Tooldur calculator.' },
  es: { added: 'se agregó al espacio de trabajo.', loginRequired: 'Debes iniciar sesión antes de guardar.', saveError: 'La tabla de historial no está lista o faltan permisos.', saved: 'Herramienta guardada en el historial.', projectReady: 'La nota del proyecto está lista. Redirigiendo a gestión de proyectos.', noteCopied: 'Nota técnica copiada.', promptCopy: 'Copiar nota técnica:', aria: 'Espacio de trabajo de la herramienta', kicker: 'Espacio de miembros', title: 'Guarda el cálculo, vincúlalo al proyecto y genera salida técnica', text: 'Al iniciar sesión, puedes guardar herramientas usadas en el historial, enviarlas como nota al proyecto e imprimir PDF.', historyTitle: 'Guardar en historial', historySub: 'Registro con cuenta', projectTitle: 'Guardar en proyecto', projectSub: 'Enviar a gestión de proyectos', pdfTitle: 'PDF / imprimir', pdfSub: 'Crear salida técnica', myHistoryTitle: 'Mi historial', myHistorySub: 'Abrir cálculos guardados', noteTitle: 'Copiar nota técnica', noteSub: 'Agregar a plano o informe', shareTitle: 'Compartir', shareSub: 'Enlace o sistema', defaultNote: 'Inicia sesión para usar resultados con registros de proyecto.', category: 'Categoría', description: 'Descripción', source: 'Página de herramienta', pageSave: 'Registro de página', general: 'General', defaultDescription: 'Calculadora Tooldur.' },
  zh: { added: '页面已添加到工作区。', loginRequired: '保存前请先登录。', saveError: '历史记录表尚未准备好或权限不足。', saved: '工具已保存到历史记录。', projectReady: '项目备注已准备好，正在跳转到项目管理。', noteCopied: '技术说明已复制。', promptCopy: '复制技术说明:', aria: '工具工作区', kicker: '会员工作区', title: '保存计算、关联项目并导出技术输出', text: '登录后可以将工具保存到历史记录，作为备注发送到项目管理，并打印 PDF 输出。', historyTitle: '保存到历史', historySub: '会员计算记录', projectTitle: '保存到项目', projectSub: '发送到项目管理', pdfTitle: 'PDF / 打印', pdfSub: '生成技术输出', myHistoryTitle: '我的历史', myHistorySub: '打开已保存计算', noteTitle: '复制技术说明', noteSub: '添加到图纸或报告', shareTitle: '分享', shareSub: '链接或系统分享', defaultNote: '登录后可将结果用于项目记录。', category: '分类', description: '说明', source: '工具页面', pageSave: '页面记录', general: '通用', defaultDescription: 'Tooldur 计算器。' },
  hi: { added: 'पेज वर्कस्पेस में जोड़ा गया।', loginRequired: 'सेव करने से पहले लॉगिन करें।', saveError: 'हिस्ट्री टेबल तैयार नहीं है या अनुमति नहीं है।', saved: 'टूल हिस्ट्री में सेव हो गया।', projectReady: 'प्रोजेक्ट नोट तैयार है। प्रोजेक्ट मैनेजमेंट पर भेजा जा रहा है।', noteCopied: 'तकनीकी नोट कॉपी हो गया।', promptCopy: 'तकनीकी नोट कॉपी करें:', aria: 'टूल वर्कस्पेस', kicker: 'मेंबर वर्कस्पेस', title: 'कैलकुलेशन सेव करें, प्रोजेक्ट से जोड़ें, तकनीकी आउटपुट लें', text: 'लॉगिन होने पर आप उपयोग किए गए टूल्स को हिस्ट्री में सेव कर सकते हैं, प्रोजेक्ट नोट बना सकते हैं और PDF प्रिंट कर सकते हैं।', historyTitle: 'हिस्ट्री में सेव', historySub: 'मेंबर कैलकुलेशन रिकॉर्ड', projectTitle: 'प्रोजेक्ट में सेव', projectSub: 'प्रोजेक्ट मैनेजमेंट भेजें', pdfTitle: 'PDF / प्रिंट', pdfSub: 'तकनीकी आउटपुट बनाएं', myHistoryTitle: 'मेरी हिस्ट्री', myHistorySub: 'सेव कैलकुलेशन खोलें', noteTitle: 'तकनीकी नोट कॉपी करें', noteSub: 'ड्रॉइंग या रिपोर्ट में जोड़ें', shareTitle: 'शेयर', shareSub: 'लिंक या सिस्टम शेयर', defaultNote: 'प्रोजेक्ट रिकॉर्ड के साथ परिणाम उपयोग करने के लिए लॉगिन करें।', category: 'श्रेणी', description: 'विवरण', source: 'टूल पेज', pageSave: 'पेज रिकॉर्ड', general: 'सामान्य', defaultDescription: 'Tooldur कैलकुलेटर।' },
  ar: { added: 'تمت إضافتها إلى مساحة العمل.', loginRequired: 'سجّل الدخول قبل الحفظ.', saveError: 'جدول السجل غير جاهز أو الصلاحية ناقصة.', saved: 'تم حفظ الأداة في السجل.', projectReady: 'ملاحظة المشروع جاهزة. جارٍ التوجيه إلى إدارة المشاريع.', noteCopied: 'تم نسخ الملاحظة الفنية.', promptCopy: 'نسخ الملاحظة الفنية:', aria: 'مساحة عمل الأداة', kicker: 'مساحة عمل للأعضاء', title: 'احفظ الحساب واربطه بالمشروع وأخرج نتيجة فنية', text: 'بعد تسجيل الدخول يمكنك حفظ الأدوات في السجل، إرسالها كملاحظات إلى إدارة المشاريع وطباعة PDF.', historyTitle: 'حفظ في السجل', historySub: 'سجل حساب للأعضاء', projectTitle: 'حفظ في المشروع', projectSub: 'إرسال إلى إدارة المشاريع', pdfTitle: 'PDF / طباعة', pdfSub: 'إنشاء مخرج فني', myHistoryTitle: 'سجلي', myHistorySub: 'فتح الحسابات المحفوظة', noteTitle: 'نسخ ملاحظة فنية', noteSub: 'إضافة إلى رسم أو تقرير', shareTitle: 'مشاركة', shareSub: 'رابط أو مشاركة النظام', defaultNote: 'سجّل الدخول لاستخدام النتائج مع سجلات المشروع.', category: 'الفئة', description: 'الوصف', source: 'صفحة الأداة', pageSave: 'سجل الصفحة', general: 'عام', defaultDescription: 'حاسبة Tooldur.' },
};

function buildSummary(tool: Tool, t: (typeof copy)['tr']) { return `${tool.name} ${t.added}`; }

export default function CalculatorWorkspacePanel({ tool, locale = 'tr' }: Props) {
  const [status, setStatus] = useState<string>('');
  const category = locale === 'tr' ? getCategoryById(tool.category) : getLocalizedCategoryById(tool.category, locale);
  const t = copy[locale] || copy.tr;
  const summary = useMemo(() => buildSummary(tool, t), [tool, t]);

  const showStatus = (message: string) => {
    setStatus(message);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tooldur-toast', { detail: message }));
    window.setTimeout(() => setStatus(''), 2600);
  };

  const saveToHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showStatus(t.loginRequired);
      window.location.href = `/giris?next=${getLocalizedPath(locale, 'tool', tool.slug)}`;
      return;
    }
    const { error } = await supabase.from('calculation_history').insert({
      user_id: session.user.id,
      tool_slug: tool.slug,
      tool_name: tool.name,
      category: tool.category || null,
      inputs: { source: t.source, tool: tool.name },
      outputs: { status: t.pageSave, description: tool.description || '' },
      summary,
      calculated_at: new Date().toISOString(),
    });
    if (error) { showStatus(t.saveError); return; }
    showStatus(t.saved);
  };

  const saveToProject = () => {
    if (typeof window === 'undefined') return;
    const payload = {
      type: 'tool-result', toolSlug: tool.slug, toolName: tool.name, category: category?.name || tool.category || t.general,
      summary, note: `${tool.name}: ${tool.description || t.defaultDescription}`,
      url: `${window.location.origin}${getLocalizedPath(locale, 'tool', tool.slug)}`, createdAt: new Date().toISOString(),
    };
    localStorage.setItem('tooldur_pending_project_item', JSON.stringify(payload));
    showStatus(t.projectReady);
    window.setTimeout(() => { window.location.href = getLocalizedPath(locale, 'project-management') + '?from=tool'; }, 700);
  };

  const printPdf = () => { if (typeof window !== 'undefined') window.print(); };

  const copyTechnicalNote = async () => {
    const text = `${tool.name}\n${t.category}: ${category?.name || tool.category || t.general}\n${t.description}: ${tool.description || '-'}\nLink: ${typeof window !== 'undefined' ? window.location.href : `https://www.tooldur.com${getLocalizedPath(locale, 'tool', tool.slug)}`}`;
    try { await navigator.clipboard.writeText(text); showStatus(t.noteCopied); }
    catch { window.prompt(t.promptCopy, text); }
  };

  const shareTool = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try { await navigator.share({ title: tool.name, text: tool.description || tool.name, url: window.location.href }); return; } catch { return; }
    }
    copyTechnicalNote();
  };

  return (
    <section className="td-workspace-panel" aria-label={t.aria}>
      <div className="td-workspace-head">
        <span className="td-workspace-kicker">{t.kicker}</span>
        <h2>{t.title}</h2>
        <p>{t.text}</p>
      </div>
      <div className="td-workspace-grid">
        <button type="button" onClick={saveToHistory} className="td-workspace-action primary"><BookmarkPlus size={18} /><span><strong>{t.historyTitle}</strong><em>{t.historySub}</em></span></button>
        <button type="button" onClick={saveToProject} className="td-workspace-action"><FolderPlus size={18} /><span><strong>{t.projectTitle}</strong><em>{t.projectSub}</em></span></button>
        <button type="button" onClick={printPdf} className="td-workspace-action"><FileDown size={18} /><span><strong>{t.pdfTitle}</strong><em>{t.pdfSub}</em></span></button>
        <Link href="/dashboard/gecmis" className="td-workspace-action"><History size={18} /><span><strong>{t.myHistoryTitle}</strong><em>{t.myHistorySub}</em></span></Link>
        <button type="button" onClick={copyTechnicalNote} className="td-workspace-action"><Clipboard size={18} /><span><strong>{t.noteTitle}</strong><em>{t.noteSub}</em></span></button>
        <button type="button" onClick={shareTool} className="td-workspace-action"><Share2 size={18} /><span><strong>{t.shareTitle}</strong><em>{t.shareSub}</em></span></button>
      </div>
      <div className="td-workspace-note"><CheckCircle2 size={16} /><span>{status || t.defaultNote}</span><Lock size={14} /></div>
    </section>
  );
}
