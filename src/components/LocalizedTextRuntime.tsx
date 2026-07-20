'use client';

import { ReactNode, useEffect } from 'react';
import { categories, tools } from '@/data/tools';
import { getLocalizedCategory, getLocalizedTool } from '@/lib/toolLocalization';
import type { Locale } from '@/lib/siteLanguage';

type Dict = Record<string, string>;

type Props = {
  locale?: Locale;
  children: ReactNode;
};

const COMMON: Record<Exclude<Locale, 'tr'>, Dict> = {
  en: {
    'Değer': 'Value',
    'Sonuç': 'Result',
    'Sonuçlar': 'Results',
    'Hesapla': 'Calculate',
    'Temizle': 'Clear',
    'Sıfırla': 'Reset',
    'Kopyala': 'Copy',
    'Sonucu kopyala': 'Copy result',
    'Örnekler': 'Examples',
    'Hızlı bilgi': 'Quick info',
    'Kısa bilgi': 'Quick info',
    'Formül': 'Formula',
    'Formül ve kullanım notu': 'Formula and usage note',
    'Pratik kullanım': 'Practical use',
    'Nasıl kullanılır?': 'How to use it',
    'Ne Hesaplanacak?': 'What will be calculated?',
    'Hesaplama Modu': 'Calculation mode',
    'Hesaplama Yöntemi': 'Calculation method',
    'Ölçü birimi': 'Unit',
    'Birimleri yer değiştir': 'Swap units',
    'Birimleri Takas Et': 'Swap units',
    'Birimleri değiştir': 'Change units',
    'Kaynak birim': 'Source unit',
    'Hedef birim': 'Target unit',
    'Giriş Değeri': 'Input value',
    'Dönüştürülen Değer': 'Converted value',
    'Henüz sonuç yok.': 'No result yet.',
    'Malzeme': 'Material',
    'Malzeme Cinsi': 'Material type',
    'Boyut ve Malzeme Ayarları': 'Size and material settings',
    'Proje detaylarını giriniz': 'Enter project details',
    'Uzunluk (mm)': 'Length (mm)',
    'Uzunluk (m)': 'Length (m)',
    'Uzunluk': 'Length',
    'Genişlik (mm)': 'Width (mm)',
    'Genişlik (m)': 'Width (m)',
    'Genişlik': 'Width',
    'Kalınlık (mm)': 'Thickness (mm)',
    'Kalınlık (m)': 'Thickness (m)',
    'Kalınlık': 'Thickness',
    'Yükseklik (m)': 'Height (m)',
    'Yükseklik (h)': 'Height (h)',
    'Adet': 'Quantity',
    'Toplam': 'Total',
    'Ara Toplam': 'Subtotal',
    'Alan': 'Area',
    'ALAN': 'AREA',
    'ÇEVRE': 'PERIMETER',
    'Çevre': 'Perimeter',
    'Hacim': 'Volume',
    'Ağırlık': 'Weight',
    'Yoğunluk': 'Density',
    'Tek Plaka Ağırlığı': 'Single plate weight',
    'Tek Parça Ağırlığı': 'Single piece weight',
    'Toplam Ağırlık': 'Total weight',
    'Düz Sac': 'Flat sheet',
    'Düz sac ağırlığı': 'Flat sheet weight',
    'm² Başına': 'Per m²',
    'm² başına ağırlık': 'Weight per m²',
    'Levha Ağırlık Hesaplama': 'Sheet/Plate Weight Calculator',
    'Levha ağırlığı hesabı hakkında': 'About sheet/plate weight calculation',
    'Levha Kesit Görseli': 'Sheet section visual',
    'Çelik Sac m² Ağırlıkları (kg/m²)': 'Steel sheet m² weights (kg/m²)',
    'Ağırlık Hesapla': 'Calculate weight',
    'Malzeme, ölçü ve adet bilgilerine göre levha ağırlığını hızlıca hesaplayın.': 'Quickly calculate sheet/plate weight from material, dimensions and quantity.',
    'Bu araç, levha ölçülerini ve malzeme yoğunluğunu kullanarak tek parça ve toplam ağırlığı hesaplar.': 'This tool calculates single-piece and total weight using sheet dimensions and material density.',
    'Seçilen malzeme:': 'Selected material:',
    'Çelik / Demir': 'Steel / Iron',
    'Çelik': 'Steel',
    'Paslanmaz Çelik': 'Stainless steel',
    'Alüminyum': 'Aluminum',
    'Bakır': 'Copper',
    'Pirinç': 'Brass',
    'Kurşun': 'Lead',
    'Çinko': 'Zinc',
    'Titanyum': 'Titanium',
    'Karbon Çeliği': 'Carbon steel',
    'Dökme Demir': 'Cast iron',
    'Uzun Kenar (a)': 'Long side (a)',
    'Kısa Kenar (b)': 'Short side (b)',
    'Kenar (a)': 'Side (a)',
    'Kenar a': 'Side a',
    'Kenar b': 'Side b',
    'Kenar c': 'Side c',
    'Yarıçap (r)': 'Radius (r)',
    'Taban (a)': 'Base (a)',
    'Taban Kenarı (a)': 'Base side (a)',
    'Taban Yarıçapı (r)': 'Base radius (r)',
    'Üst Taban (a)': 'Top base (a)',
    'Alt Taban (b)': 'Bottom base (b)',
    'Köşegen 1 (d1)': 'Diagonal 1 (d1)',
    'Köşegen 2 (d2)': 'Diagonal 2 (d2)',
    'Büyük Yarı Eksen (a)': 'Major semi-axis (a)',
    'Küçük Yarı Eksen (b)': 'Minor semi-axis (b)',
    'Kare': 'Square',
    'Dikdörtgen': 'Rectangle',
    'Daire': 'Circle',
    'Üçgen': 'Triangle',
    'Üçgen (3 Kenar)': 'Triangle (3 sides)',
    'Üçgen (Taban-Yükseklik)': 'Triangle (base-height)',
    'Eşkenar Dörtgen': 'Rhombus',
    'Yamuk': 'Trapezoid',
    'Paralelkenar': 'Parallelogram',
    'Elips': 'Ellipse',
    'Küp': 'Cube',
    'Prizma': 'Prism',
    'Silindir': 'Cylinder',
    'Küre': 'Sphere',
    'Koni': 'Cone',
    'Piramit': 'Pyramid',
    'Dikdörtgen Prizma': 'Rectangular prism',
    'Üçgen Prizma': 'Triangular prism',
    'Basınç': 'Pressure',
    'Çap': 'Diameter',
    'Dış Çap': 'Outer diameter',
    'İç Çap': 'Inner diameter',
    'Güvenlik': 'Safety',
    'Güvenlik Katsayısı': 'Safety factor',
    'Birim Ağırlık': 'Unit weight',
    'Metal Kesit Alanı': 'Metal section area',
    'Akış Alanı': 'Flow area',
    'Et Kalınlığı Bul': 'Find wall thickness',
    'Basınç Kapasitesi': 'Pressure capacity',
    'İzin Verilen Basınç': 'Allowable pressure',
    'Cıvata Sıkma Torku Hesaplama': 'Bolt Tightening Torque Calculator',
    'Vida ölçüsü': 'Bolt size',
    'Cıvata kalite sınıfı': 'Bolt grade',
    'Sürtünme katsayısı K': 'Friction coefficient K',
    'Önerilen tork': 'Recommended torque',
    'Kontrol aralığı': 'Check range',
    'Ön yük': 'Preload',
    'Diş çekme alanı': 'Thread tensile area',
    'Hatve': 'Pitch',
    'Kaynak': 'Source',
    'Kablo Kesiti Hesaplama': 'Cable Size Calculator',
    'Çekeceğiniz Akım (Amper)': 'Current draw (ampere)',
    'Kablo Uzunluğu (metre)': 'Cable length (meter)',
    'Şebeke Gerilimi': 'Line voltage',
    'Kablo Cinsi': 'Cable type',
    'Voltaj Düşümü Hesaplama': 'Voltage Drop Calculator',
    'Elektrik Fatura Hesaplama': 'Electricity Bill Calculator',
    'Tüketim': 'Consumption',
    'Dağıtım Bedeli': 'Distribution fee',
    'KDV Oranı (%)': 'VAT rate (%)',
    'Beton Miktarı Hesaplama': 'Concrete Quantity Calculator',
    'Beton Dayanım Sınıfı': 'Concrete strength class',
    'Beton sınıfı': 'Concrete class',
    'Çimento': 'Cement',
    'Su İhtiyacı': 'Water requirement',
    'Kum (İnce)': 'Sand (fine)',
    'Çakıl (Agrega)': 'Gravel (aggregate)',
    'Emniyet Payı (Fire %)': 'Safety allowance (waste %)',
    'Toplam Brüt Hacim': 'Total gross volume',
    'ISO Geçme ve Tolerans Hesaplayıcı': 'ISO Fit and Tolerance Calculator',
    'Nominal çap (mm)': 'Nominal diameter (mm)',
    'Geçme tipi': 'Fit type',
    'Tolerans Sonucu': 'Tolerance result',
    'Geçme sınıfı': 'Fit class',
    'Boşluk / sıkılık aralığı': 'Clearance / interference range',
    'Delik min - max': 'Hole min - max',
    'Mil min - max': 'Shaft min - max',
    'Delik sapması': 'Hole deviation',
    'Mil sapması': 'Shaft deviation',
    'Teknik Çizim': 'Technical drawing',
    'Teknik Kesit Görünümü': 'Technical section view',
    'Teknik Geometri Analizi': 'Technical geometry analysis',
    'Teknik not': 'Technical note',
    'Dönüşüm sonucu': 'Conversion result',
    'Kaynak alan birimi': 'Source area unit',
    'Hedef alan birimi': 'Target area unit',
    'Kaynak basınç birimi': 'Source pressure unit',
    'Hedef basınç birimi': 'Target pressure unit',
    'Kaynak hacim birimi': 'Source volume unit',
    'Hedef hacim birimi': 'Target volume unit',
    'Ağırlık değeri': 'Weight value',
    'Alan değeri': 'Area value',
    'Basınç değeri': 'Pressure value',
    'Hacim değeri': 'Volume value',
    'Örn: 1000': 'Ex: 1000',
    'Örn: 2000': 'Ex: 2000',
    'Örn: 500': 'Ex: 500',
    'Örn: 100': 'Ex: 100',
    'Örn: 10': 'Ex: 10',
    'Örn: 6': 'Ex: 6',
    'Örn: 5': 'Ex: 5',
    'Örn: 4': 'Ex: 4',
    'Örn: 3': 'Ex: 3',
    'Örn: 2': 'Ex: 2',
    'Örn: 1': 'Ex: 1',
    'Örn:': 'Ex:',
  },
  es: {
    'Değer': 'Valor', 'Sonuç': 'Resultado', 'Sonuçlar': 'Resultados', 'Hesapla': 'Calcular', 'Temizle': 'Limpiar', 'Sıfırla': 'Restablecer', 'Kopyala': 'Copiar', 'Sonucu kopyala': 'Copiar resultado', 'Örnekler': 'Ejemplos', 'Hızlı bilgi': 'Información rápida', 'Kısa bilgi': 'Información rápida', 'Formül': 'Fórmula', 'Formül ve kullanım notu': 'Fórmula y nota de uso', 'Pratik kullanım': 'Uso práctico', 'Nasıl kullanılır?': 'Cómo se usa', 'Ne Hesaplanacak?': 'Qué se calculará', 'Hesaplama Modu': 'Modo de cálculo', 'Hesaplama Yöntemi': 'Método de cálculo', 'Ölçü birimi': 'Unidad', 'Birimleri yer değiştir': 'Intercambiar unidades', 'Birimleri Takas Et': 'Intercambiar unidades', 'Birimleri değiştir': 'Cambiar unidades', 'Kaynak birim': 'Unidad origen', 'Hedef birim': 'Unidad destino', 'Giriş Değeri': 'Valor de entrada', 'Dönüştürülen Değer': 'Valor convertido', 'Henüz sonuç yok.': 'Aún no hay resultado.', 'Malzeme': 'Material', 'Malzeme Cinsi': 'Tipo de material', 'Boyut ve Malzeme Ayarları': 'Ajustes de tamaño y material', 'Proje detaylarını giriniz': 'Introduce los detalles del proyecto', 'Uzunluk (mm)': 'Longitud (mm)', 'Uzunluk (m)': 'Longitud (m)', 'Uzunluk': 'Longitud', 'Genişlik (mm)': 'Anchura (mm)', 'Genişlik (m)': 'Anchura (m)', 'Genişlik': 'Anchura', 'Kalınlık (mm)': 'Espesor (mm)', 'Kalınlık (m)': 'Espesor (m)', 'Kalınlık': 'Espesor', 'Yükseklik (m)': 'Altura (m)', 'Yükseklik (h)': 'Altura (h)', 'Adet': 'Cantidad', 'Toplam': 'Total', 'Ara Toplam': 'Subtotal', 'Alan': 'Área', 'ALAN': 'ÁREA', 'ÇEVRE': 'PERÍMETRO', 'Çevre': 'Perímetro', 'Hacim': 'Volumen', 'Ağırlık': 'Peso', 'Yoğunluk': 'Densidad', 'Tek Plaka Ağırlığı': 'Peso de una placa', 'Tek Parça Ağırlığı': 'Peso por pieza', 'Toplam Ağırlık': 'Peso total', 'Düz Sac': 'Chapa plana', 'Düz sac ağırlığı': 'Peso de chapa plana', 'm² Başına': 'Por m²', 'm² başına ağırlık': 'Peso por m²', 'Levha Ağırlık Hesaplama': 'Calculadora de peso de chapa/placa', 'Levha ağırlığı hesabı hakkında': 'Sobre el cálculo de peso de chapa/placa', 'Levha Kesit Görseli': 'Visual de sección de placa', 'Çelik Sac m² Ağırlıkları (kg/m²)': 'Pesos de chapa de acero por m² (kg/m²)', 'Ağırlık Hesapla': 'Calcular peso', 'Malzeme, ölçü ve adet bilgilerine göre levha ağırlığını hızlıca hesaplayın.': 'Calcula rápidamente el peso de la placa según material, medidas y cantidad.', 'Bu araç, levha ölçülerini ve malzeme yoğunluğunu kullanarak tek parça ve toplam ağırlığı hesaplar.': 'Esta herramienta calcula el peso por pieza y total usando dimensiones de placa y densidad del material.', 'Seçilen malzeme:': 'Material seleccionado:', 'Çelik / Demir': 'Acero / Hierro', 'Çelik': 'Acero', 'Paslanmaz Çelik': 'Acero inoxidable', 'Alüminyum': 'Aluminio', 'Bakır': 'Cobre', 'Pirinç': 'Latón', 'Kurşun': 'Plomo', 'Çinko': 'Zinc', 'Titanyum': 'Titanio', 'Karbon Çeliği': 'Acero al carbono', 'Dökme Demir': 'Hierro fundido', 'Uzun Kenar (a)': 'Lado largo (a)', 'Kısa Kenar (b)': 'Lado corto (b)', 'Kenar (a)': 'Lado (a)', 'Kenar a': 'Lado a', 'Kenar b': 'Lado b', 'Kenar c': 'Lado c', 'Yarıçap (r)': 'Radio (r)', 'Taban (a)': 'Base (a)', 'Taban Kenarı (a)': 'Lado base (a)', 'Taban Yarıçapı (r)': 'Radio de base (r)', 'Üst Taban (a)': 'Base superior (a)', 'Alt Taban (b)': 'Base inferior (b)', 'Köşegen 1 (d1)': 'Diagonal 1 (d1)', 'Köşegen 2 (d2)': 'Diagonal 2 (d2)', 'Büyük Yarı Eksen (a)': 'Semieje mayor (a)', 'Küçük Yarı Eksen (b)': 'Semieje menor (b)', 'Kare': 'Cuadrado', 'Dikdörtgen': 'Rectángulo', 'Daire': 'Círculo', 'Üçgen': 'Triángulo', 'Üçgen (3 Kenar)': 'Triángulo (3 lados)', 'Üçgen (Taban-Yükseklik)': 'Triángulo (base-altura)', 'Eşkenar Dörtgen': 'Rombo', 'Yamuk': 'Trapecio', 'Paralelkenar': 'Paralelogramo', 'Elips': 'Elipse', 'Küp': 'Cubo', 'Prizma': 'Prisma', 'Silindir': 'Cilindro', 'Küre': 'Esfera', 'Koni': 'Cono', 'Piramit': 'Pirámide', 'Dikdörtgen Prizma': 'Prisma rectangular', 'Üçgen Prizma': 'Prisma triangular', 'Basınç': 'Presión', 'Çap': 'Diámetro', 'Dış Çap': 'Diámetro exterior', 'İç Çap': 'Diámetro interior', 'Güvenlik': 'Seguridad', 'Güvenlik Katsayısı': 'Factor de seguridad', 'Birim Ağırlık': 'Peso unitario', 'Metal Kesit Alanı': 'Área de sección metálica', 'Akış Alanı': 'Área de flujo', 'Et Kalınlığı Bul': 'Calcular espesor de pared', 'Basınç Kapasitesi': 'Capacidad de presión', 'İzin Verilen Basınç': 'Presión admisible', 'Cıvata Sıkma Torku Hesaplama': 'Calculadora de par de apriete de tornillos', 'Vida ölçüsü': 'Tamaño de tornillo', 'Cıvata kalite sınıfı': 'Clase de tornillo', 'Sürtünme katsayısı K': 'Coeficiente de fricción K', 'Önerilen tork': 'Par recomendado', 'Kontrol aralığı': 'Rango de control', 'Ön yük': 'Precarga', 'Diş çekme alanı': 'Área resistente de rosca', 'Hatve': 'Paso', 'Kaynak': 'Fuente', 'Kablo Kesiti Hesaplama': 'Calculadora de sección de cable', 'Çekeceğiniz Akım (Amper)': 'Corriente requerida (amperios)', 'Kablo Uzunluğu (metre)': 'Longitud del cable (metro)', 'Şebeke Gerilimi': 'Tensión de red', 'Kablo Cinsi': 'Tipo de cable', 'Voltaj Düşümü Hesaplama': 'Calculadora de caída de tensión', 'Elektrik Fatura Hesaplama': 'Calculadora de factura eléctrica', 'Tüketim': 'Consumo', 'Dağıtım Bedeli': 'Cargo de distribución', 'KDV Oranı (%)': 'IVA (%)', 'Beton Miktarı Hesaplama': 'Calculadora de cantidad de hormigón', 'Beton Dayanım Sınıfı': 'Clase de resistencia del hormigón', 'Beton sınıfı': 'Clase de hormigón', 'Çimento': 'Cemento', 'Su İhtiyacı': 'Necesidad de agua', 'Kum (İnce)': 'Arena (fina)', 'Çakıl (Agrega)': 'Grava (agregado)', 'Emniyet Payı (Fire %)': 'Margen de seguridad (merma %)', 'Toplam Brüt Hacim': 'Volumen bruto total', 'ISO Geçme ve Tolerans Hesaplayıcı': 'Calculadora de ajustes y tolerancias ISO', 'Nominal çap (mm)': 'Diámetro nominal (mm)', 'Geçme tipi': 'Tipo de ajuste', 'Tolerans Sonucu': 'Resultado de tolerancia', 'Geçme sınıfı': 'Clase de ajuste', 'Boşluk / sıkılık aralığı': 'Rango de holgura / interferencia', 'Delik min - max': 'Agujero mín - máx', 'Mil min - max': 'Eje mín - máx', 'Delik sapması': 'Desviación del agujero', 'Mil sapması': 'Desviación del eje', 'Teknik Çizim': 'Dibujo técnico', 'Teknik Kesit Görünümü': 'Vista técnica de sección', 'Teknik Geometri Analizi': 'Análisis geométrico técnico', 'Teknik not': 'Nota técnica', 'Dönüşüm sonucu': 'Resultado de conversión', 'Kaynak alan birimi': 'Unidad de área origen', 'Hedef alan birimi': 'Unidad de área destino', 'Kaynak basınç birimi': 'Unidad de presión origen', 'Hedef basınç birimi': 'Unidad de presión destino', 'Kaynak hacim birimi': 'Unidad de volumen origen', 'Hedef hacim birimi': 'Unidad de volumen destino', 'Ağırlık değeri': 'Valor de peso', 'Alan değeri': 'Valor de área', 'Basınç değeri': 'Valor de presión', 'Hacim değeri': 'Valor de volumen', 'Örn: 1000': 'Ej: 1000', 'Örn: 2000': 'Ej: 2000', 'Örn: 500': 'Ej: 500', 'Örn: 100': 'Ej: 100', 'Örn: 10': 'Ej: 10', 'Örn: 6': 'Ej: 6', 'Örn: 5': 'Ej: 5', 'Örn: 4': 'Ej: 4', 'Örn: 3': 'Ej: 3', 'Örn: 2': 'Ej: 2', 'Örn: 1': 'Ej: 1', 'Örn:': 'Ej:'
  },
  zh: {
    'Değer': '数值', 'Sonuç': '结果', 'Sonuçlar': '结果', 'Hesapla': '计算', 'Temizle': '清除', 'Sıfırla': '重置', 'Kopyala': '复制', 'Sonucu kopyala': '复制结果', 'Örnekler': '示例', 'Hızlı bilgi': '快速信息', 'Kısa bilgi': '快速信息', 'Formül': '公式', 'Formül ve kullanım notu': '公式和使用说明', 'Pratik kullanım': '实际用途', 'Nasıl kullanılır?': '如何使用', 'Ne Hesaplanacak?': '要计算什么？', 'Hesaplama Modu': '计算模式', 'Hesaplama Yöntemi': '计算方法', 'Ölçü birimi': '单位', 'Birimleri yer değiştir': '交换单位', 'Birimleri Takas Et': '交换单位', 'Birimleri değiştir': '更改单位', 'Kaynak birim': '源单位', 'Hedef birim': '目标单位', 'Giriş Değeri': '输入值', 'Dönüştürülen Değer': '转换值', 'Henüz sonuç yok.': '暂无结果。', 'Malzeme': '材料', 'Malzeme Cinsi': '材料类型', 'Boyut ve Malzeme Ayarları': '尺寸和材料设置', 'Proje detaylarını giriniz': '输入项目详情', 'Uzunluk (mm)': '长度 (mm)', 'Uzunluk (m)': '长度 (m)', 'Uzunluk': '长度', 'Genişlik (mm)': '宽度 (mm)', 'Genişlik (m)': '宽度 (m)', 'Genişlik': '宽度', 'Kalınlık (mm)': '厚度 (mm)', 'Kalınlık (m)': '厚度 (m)', 'Kalınlık': '厚度', 'Yükseklik (m)': '高度 (m)', 'Yükseklik (h)': '高度 (h)', 'Adet': '数量', 'Toplam': '总计', 'Ara Toplam': '小计', 'Alan': '面积', 'ALAN': '面积', 'ÇEVRE': '周长', 'Çevre': '周长', 'Hacim': '体积', 'Ağırlık': '重量', 'Yoğunluk': '密度', 'Tek Plaka Ağırlığı': '单板重量', 'Tek Parça Ağırlığı': '单件重量', 'Toplam Ağırlık': '总重量', 'Düz Sac': '平板', 'Düz sac ağırlığı': '平板重量', 'm² Başına': '每 m²', 'm² başına ağırlık': '每 m² 重量', 'Levha Ağırlık Hesaplama': '板材重量计算器', 'Levha ağırlığı hesabı hakkında': '关于板材重量计算', 'Levha Kesit Görseli': '板材截面图', 'Çelik Sac m² Ağırlıkları (kg/m²)': '钢板每 m² 重量 (kg/m²)', 'Ağırlık Hesapla': '计算重量', 'Malzeme, ölçü ve adet bilgilerine göre levha ağırlığını hızlıca hesaplayın.': '根据材料、尺寸和数量快速计算板材重量。', 'Bu araç, levha ölçülerini ve malzeme yoğunluğunu kullanarak tek parça ve toplam ağırlığı hesaplar.': '此工具根据板材尺寸和材料密度计算单件及总重量。', 'Seçilen malzeme:': '所选材料:', 'Çelik / Demir': '钢 / 铁', 'Çelik': '钢', 'Paslanmaz Çelik': '不锈钢', 'Alüminyum': '铝', 'Bakır': '铜', 'Pirinç': '黄铜', 'Kurşun': '铅', 'Çinko': '锌', 'Titanyum': '钛', 'Karbon Çeliği': '碳钢', 'Dökme Demir': '铸铁', 'Uzun Kenar (a)': '长边 (a)', 'Kısa Kenar (b)': '短边 (b)', 'Kenar (a)': '边 (a)', 'Kenar a': '边 a', 'Kenar b': '边 b', 'Kenar c': '边 c', 'Yarıçap (r)': '半径 (r)', 'Taban (a)': '底边 (a)', 'Taban Kenarı (a)': '底边 (a)', 'Taban Yarıçapı (r)': '底部半径 (r)', 'Üst Taban (a)': '上底 (a)', 'Alt Taban (b)': '下底 (b)', 'Köşegen 1 (d1)': '对角线 1 (d1)', 'Köşegen 2 (d2)': '对角线 2 (d2)', 'Büyük Yarı Eksen (a)': '长半轴 (a)', 'Küçük Yarı Eksen (b)': '短半轴 (b)', 'Kare': '正方形', 'Dikdörtgen': '矩形', 'Daire': '圆形', 'Üçgen': '三角形', 'Üçgen (3 Kenar)': '三角形（三边）', 'Üçgen (Taban-Yükseklik)': '三角形（底-高）', 'Eşkenar Dörtgen': '菱形', 'Yamuk': '梯形', 'Paralelkenar': '平行四边形', 'Elips': '椭圆', 'Küp': '立方体', 'Prizma': '棱柱', 'Silindir': '圆柱', 'Küre': '球体', 'Koni': '圆锥', 'Piramit': '金字塔', 'Dikdörtgen Prizma': '长方体', 'Üçgen Prizma': '三棱柱', 'Basınç': '压力', 'Çap': '直径', 'Dış Çap': '外径', 'İç Çap': '内径', 'Güvenlik': '安全', 'Güvenlik Katsayısı': '安全系数', 'Birim Ağırlık': '单位重量', 'Metal Kesit Alanı': '金属截面积', 'Akış Alanı': '流通面积', 'Et Kalınlığı Bul': '计算壁厚', 'Basınç Kapasitesi': '承压能力', 'İzin Verilen Basınç': '允许压力', 'Cıvata Sıkma Torku Hesaplama': '螺栓拧紧扭矩计算器', 'Vida ölçüsü': '螺栓尺寸', 'Cıvata kalite sınıfı': '螺栓等级', 'Sürtünme katsayısı K': '摩擦系数 K', 'Önerilen tork': '推荐扭矩', 'Kontrol aralığı': '检查范围', 'Ön yük': '预紧力', 'Diş çekme alanı': '螺纹受拉面积', 'Hatve': '螺距', 'Kaynak': '来源', 'Kablo Kesiti Hesaplama': '电缆截面积计算器', 'Çekeceğiniz Akım (Amper)': '电流 (A)', 'Kablo Uzunluğu (metre)': '电缆长度 (m)', 'Şebeke Gerilimi': '电网电压', 'Kablo Cinsi': '电缆类型', 'Voltaj Düşümü Hesaplama': '电压降计算器', 'Elektrik Fatura Hesaplama': '电费计算器', 'Tüketim': '用电量', 'Dağıtım Bedeli': '配电费用', 'KDV Oranı (%)': '增值税率 (%)', 'Beton Miktarı Hesaplama': '混凝土用量计算器', 'Beton Dayanım Sınıfı': '混凝土强度等级', 'Beton sınıfı': '混凝土等级', 'Çimento': '水泥', 'Su İhtiyacı': '需水量', 'Kum (İnce)': '砂（细）', 'Çakıl (Agrega)': '碎石（骨料）', 'Emniyet Payı (Fire %)': '安全余量（损耗 %）', 'Toplam Brüt Hacim': '总毛体积', 'ISO Geçme ve Tolerans Hesaplayıcı': 'ISO 配合与公差计算器', 'Nominal çap (mm)': '公称直径 (mm)', 'Geçme tipi': '配合类型', 'Tolerans Sonucu': '公差结果', 'Geçme sınıfı': '配合等级', 'Boşluk / sıkılık aralığı': '间隙 / 过盈范围', 'Delik min - max': '孔 min - max', 'Mil min - max': '轴 min - max', 'Delik sapması': '孔偏差', 'Mil sapması': '轴偏差', 'Teknik Çizim': '技术图纸', 'Teknik Kesit Görünümü': '技术剖视图', 'Teknik Geometri Analizi': '技术几何分析', 'Teknik not': '技术说明', 'Dönüşüm sonucu': '转换结果', 'Kaynak alan birimi': '源面积单位', 'Hedef alan birimi': '目标面积单位', 'Kaynak basınç birimi': '源压力单位', 'Hedef basınç birimi': '目标压力单位', 'Kaynak hacim birimi': '源体积单位', 'Hedef hacim birimi': '目标体积单位', 'Ağırlık değeri': '重量值', 'Alan değeri': '面积值', 'Basınç değeri': '压力值', 'Hacim değeri': '体积值', 'Örn: 1000': '例: 1000', 'Örn: 2000': '例: 2000', 'Örn: 500': '例: 500', 'Örn: 100': '例: 100', 'Örn: 10': '例: 10', 'Örn: 6': '例: 6', 'Örn: 5': '例: 5', 'Örn: 4': '例: 4', 'Örn: 3': '例: 3', 'Örn: 2': '例: 2', 'Örn: 1': '例: 1', 'Örn:': '例:'
  },
  hi: {
    'Değer': 'मान', 'Sonuç': 'परिणाम', 'Sonuçlar': 'परिणाम', 'Hesapla': 'गणना करें', 'Temizle': 'साफ करें', 'Sıfırla': 'रीसेट', 'Kopyala': 'कॉपी', 'Sonucu kopyala': 'परिणाम कॉपी करें', 'Örnekler': 'उदाहरण', 'Hızlı bilgi': 'त्वरित जानकारी', 'Kısa bilgi': 'त्वरित जानकारी', 'Formül': 'सूत्र', 'Formül ve kullanım notu': 'सूत्र और उपयोग नोट', 'Pratik kullanım': 'व्यावहारिक उपयोग', 'Nasıl kullanılır?': 'कैसे उपयोग करें', 'Ne Hesaplanacak?': 'क्या गणना होगी?', 'Hesaplama Modu': 'गणना मोड', 'Hesaplama Yöntemi': 'गणना विधि', 'Ölçü birimi': 'यूनिट', 'Birimleri yer değiştir': 'यूनिट बदलें', 'Birimleri Takas Et': 'यूनिट बदलें', 'Birimleri değiştir': 'यूनिट बदलें', 'Kaynak birim': 'स्रोत यूनिट', 'Hedef birim': 'लक्ष्य यूनिट', 'Giriş Değeri': 'इनपुट मान', 'Dönüştürülen Değer': 'परिवर्तित मान', 'Henüz sonuç yok.': 'अभी परिणाम नहीं है।', 'Malzeme': 'सामग्री', 'Malzeme Cinsi': 'सामग्री प्रकार', 'Boyut ve Malzeme Ayarları': 'आकार और सामग्री सेटिंग', 'Proje detaylarını giriniz': 'प्रोजेक्ट विवरण दर्ज करें', 'Uzunluk (mm)': 'लंबाई (mm)', 'Uzunluk (m)': 'लंबाई (m)', 'Uzunluk': 'लंबाई', 'Genişlik (mm)': 'चौड़ाई (mm)', 'Genişlik (m)': 'चौड़ाई (m)', 'Genişlik': 'चौड़ाई', 'Kalınlık (mm)': 'मोटाई (mm)', 'Kalınlık (m)': 'मोटाई (m)', 'Kalınlık': 'मोटाई', 'Yükseklik (m)': 'ऊँचाई (m)', 'Yükseklik (h)': 'ऊँचाई (h)', 'Adet': 'मात्रा', 'Toplam': 'कुल', 'Ara Toplam': 'उप-योग', 'Alan': 'क्षेत्रफल', 'ALAN': 'क्षेत्रफल', 'ÇEVRE': 'परिमाप', 'Çevre': 'परिमाप', 'Hacim': 'आयतन', 'Ağırlık': 'वजन', 'Yoğunluk': 'घनत्व', 'Tek Plaka Ağırlığı': 'एक प्लेट का वजन', 'Tek Parça Ağırlığı': 'एक पीस का वजन', 'Toplam Ağırlık': 'कुल वजन', 'Düz Sac': 'समतल शीट', 'Düz sac ağırlığı': 'समतल शीट वजन', 'm² Başına': 'प्रति m²', 'm² başına ağırlık': 'प्रति m² वजन', 'Levha Ağırlık Hesaplama': 'शीट/प्लेट वजन कैलकुलेटर', 'Levha ağırlığı hesabı hakkında': 'शीट/प्लेट वजन गणना के बारे में', 'Levha Kesit Görseli': 'शीट सेक्शन दृश्य', 'Çelik Sac m² Ağırlıkları (kg/m²)': 'स्टील शीट m² वजन (kg/m²)', 'Ağırlık Hesapla': 'वजन गणना करें', 'Malzeme, ölçü ve adet bilgilerine göre levha ağırlığını hızlıca hesaplayın.': 'सामग्री, माप और मात्रा से शीट वजन जल्दी गणना करें।', 'Bu araç, levha ölçülerini ve malzeme yoğunluğunu kullanarak tek parça ve toplam ağırlığı hesaplar.': 'यह टूल शीट माप और सामग्री घनत्व से एक पीस और कुल वजन गणना करता है।', 'Seçilen malzeme:': 'चयनित सामग्री:', 'Çelik / Demir': 'स्टील / लोहा', 'Çelik': 'स्टील', 'Paslanmaz Çelik': 'स्टेनलेस स्टील', 'Alüminyum': 'एल्यूमिनियम', 'Bakır': 'तांबा', 'Pirinç': 'पीतल', 'Kurşun': 'सीसा', 'Çinko': 'जिंक', 'Titanyum': 'टाइटेनियम', 'Karbon Çeliği': 'कार्बन स्टील', 'Dökme Demir': 'कास्ट आयरन', 'Uzun Kenar (a)': 'लंबी साइड (a)', 'Kısa Kenar (b)': 'छोटी साइड (b)', 'Kenar (a)': 'साइड (a)', 'Kenar a': 'साइड a', 'Kenar b': 'साइड b', 'Kenar c': 'साइड c', 'Yarıçap (r)': 'त्रिज्या (r)', 'Taban (a)': 'आधार (a)', 'Taban Kenarı (a)': 'आधार साइड (a)', 'Taban Yarıçapı (r)': 'आधार त्रिज्या (r)', 'Üst Taban (a)': 'ऊपरी आधार (a)', 'Alt Taban (b)': 'निचला आधार (b)', 'Köşegen 1 (d1)': 'विकर्ण 1 (d1)', 'Köşegen 2 (d2)': 'विकर्ण 2 (d2)', 'Büyük Yarı Eksen (a)': 'बड़ा अर्ध-अक्ष (a)', 'Küçük Yarı Eksen (b)': 'छोटा अर्ध-अक्ष (b)', 'Kare': 'वर्ग', 'Dikdörtgen': 'आयत', 'Daire': 'वृत्त', 'Üçgen': 'त्रिभुज', 'Üçgen (3 Kenar)': 'त्रिभुज (3 भुजाएँ)', 'Üçgen (Taban-Yükseklik)': 'त्रिभुज (आधार-ऊँचाई)', 'Eşkenar Dörtgen': 'समचतुर्भुज', 'Yamuk': 'समलंब', 'Paralelkenar': 'समांतर चतुर्भुज', 'Elips': 'दीर्घवृत्त', 'Küp': 'घन', 'Prizma': 'प्रिज़्म', 'Silindir': 'सिलेंडर', 'Küre': 'गोला', 'Koni': 'शंकु', 'Piramit': 'पिरामिड', 'Dikdörtgen Prizma': 'आयताकार प्रिज़्म', 'Üçgen Prizma': 'त्रिभुज प्रिज़्म', 'Basınç': 'दबाव', 'Çap': 'व्यास', 'Dış Çap': 'बाहरी व्यास', 'İç Çap': 'आंतरिक व्यास', 'Güvenlik': 'सुरक्षा', 'Güvenlik Katsayısı': 'सुरक्षा गुणांक', 'Birim Ağırlık': 'यूनिट वजन', 'Metal Kesit Alanı': 'धातु सेक्शन क्षेत्र', 'Akış Alanı': 'फ्लो क्षेत्र', 'Et Kalınlığı Bul': 'वाल थिकनेस निकालें', 'Basınç Kapasitesi': 'दबाव क्षमता', 'İzin Verilen Basınç': 'अनुमत दबाव', 'Cıvata Sıkma Torku Hesaplama': 'बोल्ट टाइटनिंग टॉर्क कैलकुलेटर', 'Vida ölçüsü': 'बोल्ट आकार', 'Cıvata kalite sınıfı': 'बोल्ट ग्रेड', 'Sürtünme katsayısı K': 'घर्षण गुणांक K', 'Önerilen tork': 'अनुशंसित टॉर्क', 'Kontrol aralığı': 'कंट्रोल रेंज', 'Ön yük': 'प्रीलोड', 'Diş çekme alanı': 'थ्रेड टेंसाइल क्षेत्र', 'Hatve': 'पिच', 'Kaynak': 'स्रोत', 'Kablo Kesiti Hesaplama': 'केबल साइज कैलकुलेटर', 'Çekeceğiniz Akım (Amper)': 'करंट (एम्पियर)', 'Kablo Uzunluğu (metre)': 'केबल लंबाई (मीटर)', 'Şebeke Gerilimi': 'लाइन वोल्टेज', 'Kablo Cinsi': 'केबल प्रकार', 'Voltaj Düşümü Hesaplama': 'वोल्टेज ड्रॉप कैलकुलेटर', 'Elektrik Fatura Hesaplama': 'बिजली बिल कैलकुलेटर', 'Tüketim': 'खपत', 'Dağıtım Bedeli': 'वितरण शुल्क', 'KDV Oranı (%)': 'VAT दर (%)', 'Beton Miktarı Hesaplama': 'कंक्रीट मात्रा कैलकुलेटर', 'Beton Dayanım Sınıfı': 'कंक्रीट स्ट्रेंथ क्लास', 'Beton sınıfı': 'कंक्रीट क्लास', 'Çimento': 'सीमेंट', 'Su İhtiyacı': 'पानी आवश्यकता', 'Kum (İnce)': 'रेत (फाइन)', 'Çakıl (Agrega)': 'गिट्टी (एग्रीगेट)', 'Emniyet Payı (Fire %)': 'सेफ्टी अलाउंस (वेस्ट %)', 'Toplam Brüt Hacim': 'कुल ग्रॉस वॉल्यूम', 'ISO Geçme ve Tolerans Hesaplayıcı': 'ISO फिट और टॉलरेंस कैलकुलेटर', 'Nominal çap (mm)': 'नॉमिनल व्यास (mm)', 'Geçme tipi': 'फिट प्रकार', 'Tolerans Sonucu': 'टॉलरेंस परिणाम', 'Geçme sınıfı': 'फिट क्लास', 'Boşluk / sıkılık aralığı': 'क्लीयरेंस / इंटरफेरेंस रेंज', 'Delik min - max': 'होल min - max', 'Mil min - max': 'शाफ्ट min - max', 'Delik sapması': 'होल डेविएशन', 'Mil sapması': 'शाफ्ट डेविएशन', 'Teknik Çizim': 'तकनीकी ड्रॉइंग', 'Teknik Kesit Görünümü': 'तकनीकी सेक्शन व्यू', 'Teknik Geometri Analizi': 'तकनीकी ज्योमेट्री विश्लेषण', 'Teknik not': 'तकनीकी नोट', 'Dönüşüm sonucu': 'रूपांतरण परिणाम', 'Kaynak alan birimi': 'स्रोत क्षेत्र यूनिट', 'Hedef alan birimi': 'लक्ष्य क्षेत्र यूनिट', 'Kaynak basınç birimi': 'स्रोत दबाव यूनिट', 'Hedef basınç birimi': 'लक्ष्य दबाव यूनिट', 'Kaynak hacim birimi': 'स्रोत आयतन यूनिट', 'Hedef hacim birimi': 'लक्ष्य आयतन यूनिट', 'Ağırlık değeri': 'वजन मान', 'Alan değeri': 'क्षेत्र मान', 'Basınç değeri': 'दबाव मान', 'Hacim değeri': 'आयतन मान', 'Örn: 1000': 'उदा: 1000', 'Örn: 2000': 'उदा: 2000', 'Örn: 500': 'उदा: 500', 'Örn: 100': 'उदा: 100', 'Örn: 10': 'उदा: 10', 'Örn: 6': 'उदा: 6', 'Örn: 5': 'उदा: 5', 'Örn: 4': 'उदा: 4', 'Örn: 3': 'उदा: 3', 'Örn: 2': 'उदा: 2', 'Örn: 1': 'उदा: 1', 'Örn:': 'उदा:'
  },
  ar: {
    'Değer': 'القيمة', 'Sonuç': 'النتيجة', 'Sonuçlar': 'النتائج', 'Hesapla': 'احسب', 'Temizle': 'مسح', 'Sıfırla': 'إعادة ضبط', 'Kopyala': 'نسخ', 'Sonucu kopyala': 'نسخ النتيجة', 'Örnekler': 'أمثلة', 'Hızlı bilgi': 'معلومة سريعة', 'Kısa bilgi': 'معلومة سريعة', 'Formül': 'الصيغة', 'Formül ve kullanım notu': 'الصيغة وملاحظة الاستخدام', 'Pratik kullanım': 'استخدام عملي', 'Nasıl kullanılır?': 'طريقة الاستخدام', 'Ne Hesaplanacak?': 'ما الذي سيُحسب؟', 'Hesaplama Modu': 'وضع الحساب', 'Hesaplama Yöntemi': 'طريقة الحساب', 'Ölçü birimi': 'الوحدة', 'Birimleri yer değiştir': 'بدّل الوحدات', 'Birimleri Takas Et': 'بدّل الوحدات', 'Birimleri değiştir': 'غيّر الوحدات', 'Kaynak birim': 'الوحدة الأصلية', 'Hedef birim': 'الوحدة الهدف', 'Giriş Değeri': 'قيمة الإدخال', 'Dönüştürülen Değer': 'القيمة المحولة', 'Henüz sonuç yok.': 'لا توجد نتيجة بعد.', 'Malzeme': 'المادة', 'Malzeme Cinsi': 'نوع المادة', 'Boyut ve Malzeme Ayarları': 'إعدادات الحجم والمادة', 'Proje detaylarını giriniz': 'أدخل تفاصيل المشروع', 'Uzunluk (mm)': 'الطول (mm)', 'Uzunluk (m)': 'الطول (m)', 'Uzunluk': 'الطول', 'Genişlik (mm)': 'العرض (mm)', 'Genişlik (m)': 'العرض (m)', 'Genişlik': 'العرض', 'Kalınlık (mm)': 'السماكة (mm)', 'Kalınlık (m)': 'السماكة (m)', 'Kalınlık': 'السماكة', 'Yükseklik (m)': 'الارتفاع (m)', 'Yükseklik (h)': 'الارتفاع (h)', 'Adet': 'الكمية', 'Toplam': 'الإجمالي', 'Ara Toplam': 'المجموع الفرعي', 'Alan': 'المساحة', 'ALAN': 'المساحة', 'ÇEVRE': 'المحيط', 'Çevre': 'المحيط', 'Hacim': 'الحجم', 'Ağırlık': 'الوزن', 'Yoğunluk': 'الكثافة', 'Tek Plaka Ağırlığı': 'وزن اللوح الواحد', 'Tek Parça Ağırlığı': 'وزن القطعة الواحدة', 'Toplam Ağırlık': 'الوزن الإجمالي', 'Düz Sac': 'صاج مسطح', 'Düz sac ağırlığı': 'وزن الصاج المسطح', 'm² Başına': 'لكل m²', 'm² başına ağırlık': 'الوزن لكل m²', 'Levha Ağırlık Hesaplama': 'حاسبة وزن الصاج/اللوح', 'Levha ağırlığı hesabı hakkında': 'حول حساب وزن الصاج/اللوح', 'Levha Kesit Görseli': 'رسم مقطع اللوح', 'Çelik Sac m² Ağırlıkları (kg/m²)': 'أوزان الصاج الفولاذي لكل m² (kg/m²)', 'Ağırlık Hesapla': 'احسب الوزن', 'Malzeme, ölçü ve adet bilgilerine göre levha ağırlığını hızlıca hesaplayın.': 'احسب وزن اللوح بسرعة حسب المادة والأبعاد والكمية.', 'Bu araç, levha ölçülerini ve malzeme yoğunluğunu kullanarak tek parça ve toplam ağırlığı hesaplar.': 'تحسب هذه الأداة وزن القطعة والوزن الإجمالي باستخدام أبعاد اللوح وكثافة المادة.', 'Seçilen malzeme:': 'المادة المختارة:', 'Çelik / Demir': 'فولاذ / حديد', 'Çelik': 'فولاذ', 'Paslanmaz Çelik': 'فولاذ مقاوم للصدأ', 'Alüminyum': 'ألمنيوم', 'Bakır': 'نحاس', 'Pirinç': 'نحاس أصفر', 'Kurşun': 'رصاص', 'Çinko': 'زنك', 'Titanyum': 'تيتانيوم', 'Karbon Çeliği': 'فولاذ كربوني', 'Dökme Demir': 'حديد زهر', 'Uzun Kenar (a)': 'الضلع الطويل (a)', 'Kısa Kenar (b)': 'الضلع القصير (b)', 'Kenar (a)': 'الضلع (a)', 'Kenar a': 'الضلع a', 'Kenar b': 'الضلع b', 'Kenar c': 'الضلع c', 'Yarıçap (r)': 'نصف القطر (r)', 'Taban (a)': 'القاعدة (a)', 'Taban Kenarı (a)': 'ضلع القاعدة (a)', 'Taban Yarıçapı (r)': 'نصف قطر القاعدة (r)', 'Üst Taban (a)': 'القاعدة العليا (a)', 'Alt Taban (b)': 'القاعدة السفلى (b)', 'Köşegen 1 (d1)': 'القطر 1 (d1)', 'Köşegen 2 (d2)': 'القطر 2 (d2)', 'Büyük Yarı Eksen (a)': 'نصف المحور الأكبر (a)', 'Küçük Yarı Eksen (b)': 'نصف المحور الأصغر (b)', 'Kare': 'مربع', 'Dikdörtgen': 'مستطيل', 'Daire': 'دائرة', 'Üçgen': 'مثلث', 'Üçgen (3 Kenar)': 'مثلث (3 أضلاع)', 'Üçgen (Taban-Yükseklik)': 'مثلث (قاعدة-ارتفاع)', 'Eşkenar Dörtgen': 'معين', 'Yamuk': 'شبه منحرف', 'Paralelkenar': 'متوازي أضلاع', 'Elips': 'قطع ناقص', 'Küp': 'مكعب', 'Prizma': 'منشور', 'Silindir': 'أسطوانة', 'Küre': 'كرة', 'Koni': 'مخروط', 'Piramit': 'هرم', 'Dikdörtgen Prizma': 'منشور مستطيل', 'Üçgen Prizma': 'منشور ثلاثي', 'Basınç': 'الضغط', 'Çap': 'القطر', 'Dış Çap': 'القطر الخارجي', 'İç Çap': 'القطر الداخلي', 'Güvenlik': 'الأمان', 'Güvenlik Katsayısı': 'معامل الأمان', 'Birim Ağırlık': 'وزن الوحدة', 'Metal Kesit Alanı': 'مساحة المقطع المعدني', 'Akış Alanı': 'مساحة التدفق', 'Et Kalınlığı Bul': 'احسب سماكة الجدار', 'Basınç Kapasitesi': 'قدرة الضغط', 'İzin Verilen Basınç': 'الضغط المسموح', 'Cıvata Sıkma Torku Hesaplama': 'حاسبة عزم شد البراغي', 'Vida ölçüsü': 'مقاس البرغي', 'Cıvata kalite sınıfı': 'درجة البرغي', 'Sürtünme katsayısı K': 'معامل الاحتكاك K', 'Önerilen tork': 'العزم المقترح', 'Kontrol aralığı': 'نطاق الفحص', 'Ön yük': 'التحميل المسبق', 'Diş çekme alanı': 'مساحة شد القلاوظ', 'Hatve': 'الخطوة', 'Kaynak': 'المصدر', 'Kablo Kesiti Hesaplama': 'حاسبة مقطع الكابل', 'Çekeceğiniz Akım (Amper)': 'التيار المطلوب (أمبير)', 'Kablo Uzunluğu (metre)': 'طول الكابل (متر)', 'Şebeke Gerilimi': 'جهد الشبكة', 'Kablo Cinsi': 'نوع الكابل', 'Voltaj Düşümü Hesaplama': 'حاسبة هبوط الجهد', 'Elektrik Fatura Hesaplama': 'حاسبة فاتورة الكهرباء', 'Tüketim': 'الاستهلاك', 'Dağıtım Bedeli': 'رسوم التوزيع', 'KDV Oranı (%)': 'نسبة الضريبة (%)', 'Beton Miktarı Hesaplama': 'حاسبة كمية الخرسانة', 'Beton Dayanım Sınıfı': 'درجة مقاومة الخرسانة', 'Beton sınıfı': 'فئة الخرسانة', 'Çimento': 'إسمنت', 'Su İhtiyacı': 'احتياج الماء', 'Kum (İnce)': 'رمل (ناعم)', 'Çakıl (Agrega)': 'حصى (ركام)', 'Emniyet Payı (Fire %)': 'هامش أمان (هدر %)', 'Toplam Brüt Hacim': 'الحجم الإجمالي', 'ISO Geçme ve Tolerans Hesaplayıcı': 'حاسبة التوافق والتفاوت ISO', 'Nominal çap (mm)': 'القطر الاسمي (mm)', 'Geçme tipi': 'نوع التوافق', 'Tolerans Sonucu': 'نتيجة التفاوت', 'Geçme sınıfı': 'فئة التوافق', 'Boşluk / sıkılık aralığı': 'نطاق الخلوص / التداخل', 'Delik min - max': 'الثقب min - max', 'Mil min - max': 'العمود min - max', 'Delik sapması': 'انحراف الثقب', 'Mil sapması': 'انحراف العمود', 'Teknik Çizim': 'رسم فني', 'Teknik Kesit Görünümü': 'منظر مقطع فني', 'Teknik Geometri Analizi': 'تحليل هندسي فني', 'Teknik not': 'ملاحظة فنية', 'Dönüşüm sonucu': 'نتيجة التحويل', 'Kaynak alan birimi': 'وحدة المساحة الأصلية', 'Hedef alan birimi': 'وحدة المساحة الهدف', 'Kaynak basınç birimi': 'وحدة الضغط الأصلية', 'Hedef basınç birimi': 'وحدة الضغط الهدف', 'Kaynak hacim birimi': 'وحدة الحجم الأصلية', 'Hedef hacim birimi': 'وحدة الحجم الهدف', 'Ağırlık değeri': 'قيمة الوزن', 'Alan değeri': 'قيمة المساحة', 'Basınç değeri': 'قيمة الضغط', 'Hacim değeri': 'قيمة الحجم', 'Örn: 1000': 'مثال: 1000', 'Örn: 2000': 'مثال: 2000', 'Örn: 500': 'مثال: 500', 'Örn: 100': 'مثال: 100', 'Örn: 10': 'مثال: 10', 'Örn: 6': 'مثال: 6', 'Örn: 5': 'مثال: 5', 'Örn: 4': 'مثال: 4', 'Örn: 3': 'مثال: 3', 'Örn: 2': 'مثال: 2', 'Örn: 1': 'مثال: 1', 'Örn:': 'مثال:'
  },
};

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function withOriginalSpacing(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

function buildDictionary(locale: Exclude<Locale, 'tr'>): Dict {
  const dict: Dict = { ...COMMON[locale] };
  tools.forEach((tool) => {
    const localized = getLocalizedTool(tool, locale);
    if (tool.name && localized.name && tool.name !== localized.name) dict[tool.name] = localized.name;
    if (tool.shortName && localized.shortName && tool.shortName !== localized.shortName) dict[tool.shortName] = localized.shortName;
  });
  categories.forEach((category) => {
    const localized = getLocalizedCategory(category, locale);
    if (category.name && localized.name && category.name !== localized.name) dict[category.name] = localized.name;
    if (category.description && localized.description && category.description !== localized.description) dict[category.description] = localized.description;
  });
  return dict;
}

function translateValue(value: string, dict: Dict) {
  if (!value || !value.trim()) return value;
  const normalized = normalize(value);
  if (dict[normalized]) return withOriginalSpacing(value, dict[normalized]);

  let next = value;
  const entries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
  entries.forEach(([source, target]) => {
    if (source && next.includes(source)) next = next.split(source).join(target);
  });
  next = next.replace(/Örn:/g, dict['Örn:'] || 'Ex:');
  return next;
}

function translateElement(root: HTMLElement, dict: Dict) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE'].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  textNodes.forEach((node) => {
    const translated = translateValue(node.nodeValue || '', dict);
    if (translated !== node.nodeValue) node.nodeValue = translated;
  });

  root.querySelectorAll<HTMLElement>('[placeholder], [aria-label], [title]').forEach((el) => {
    ['placeholder', 'aria-label', 'title'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      const translated = translateValue(value, dict);
      if (translated !== value) el.setAttribute(attr, translated);
    });
  });
}

export default function LocalizedTextRuntime({ locale = 'tr', children }: Props) {
  useEffect(() => {
    if (locale === 'tr') return;
    const root = document.querySelector<HTMLElement>('[data-localized-runtime="true"]');
    if (!root) return;
    const dict = buildDictionary(locale);
    let frame = 0;
    const run = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => translateElement(root, dict));
    };
    run();
    const observer = new MutationObserver(run);
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title'] });
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [locale]);

  return <div data-localized-runtime="true">{children}</div>;
}
