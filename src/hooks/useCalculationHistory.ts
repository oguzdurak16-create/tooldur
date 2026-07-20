"use client";

import { supabase } from "@/lib/supabase";

/**
 * Hesaplama geçmişi kaydetme hook'u.
 * Her calculator'da import edip hesapla() içinde çağırılır.
 *
 * Kullanım:
 *   const { saveCalculation } = useCalculationHistory();
 *   // hesapla() fonksiyonu içinde sonuç bulunduktan sonra:
 *   saveCalculation({
 *     toolSlug: "kablo-kesiti-hesaplama",
 *     toolName: "Kablo Kesiti Hesaplama",
 *     inputs: { akim: "16", mesafe: "25", gerilim: "220" },
 *     outputs: { standartKesit: 2.5, gercekGerilimDusumu: 2.1 },
 *     summary: "16A, 25m → 2.5 mm²"
 *   });
 */

export interface CalculationRecord {
  toolSlug: string;
  toolName: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  summary: string;           // Tek satır özet: "16A, 25m → 2.5 mm²"
  category?: string;
}

export function useCalculationHistory() {
  const saveCalculation = async (record: CalculationRecord) => {
    // Kullanıcı giriş yapmamışsa sessizce atla
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from("calculation_history").insert({
      user_id: session.user.id,
      tool_slug: record.toolSlug,
      tool_name: record.toolName,
      category: record.category || null,
      inputs: record.inputs,
      outputs: record.outputs,
      summary: record.summary,
      calculated_at: new Date().toISOString(),
    });
    // Hata varsa sessizce geç — kullanıcı deneyimini bozmayalım
  };

  return { saveCalculation };
}