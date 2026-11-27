type EnglishGuide = {
  title: string;
  summary: string;
  paragraphs: string[];
};

const guide = (title: string, summary: string, ...paragraphs: string[]): EnglishGuide => ({ title, summary, paragraphs });

function tapDrill(size: string, coarsePitch: string, drill: string, fine: string) {
  return guide(
    `${size} Tap Drill Size and Thread Pitch`,
    `The usual starting drill size for ${size} × ${coarsePitch} is Ø${drill} mm.`,
    `For a standard cutting tap, subtract the pitch from the nominal thread diameter, then check the recommended drill against the tap maker’s chart. Common fine-pitch examples include ${fine}. Specify the pitch on the drawing whenever a fine thread is required.`,
    'A bolt clearance hole, a cutting-tap hole, and a form-tap hole serve different purposes. Use the correct chart for the operation. For a blind hole, provide space for the tap lead and chips beyond the required full thread depth.',
  );
}

const englishGuides: Readonly<Record<string, EnglishGuide>> = {
  'mil-delik-toleransi-h7-h8-h6-js9-nedir': guide(
    'Shaft and Hole Tolerances: H7, H8, h6 and JS9',
    'Read ISO tolerance classes and calculate the extreme clearance or interference of a shaft and hole.',
    'In H7 and H8, the capital H identifies a hole zone whose lower deviation is zero. The number describes the tolerance grade. The actual width of each grade is obtained from the ISO table for the nominal diameter range. In h6, the lower-case letter identifies a shaft with zero upper deviation. JS9 has a tolerance zone centered around the nominal size.',
    'Calculate minimum clearance as the smallest hole minus the largest shaft, and maximum clearance as the largest hole minus the smallest shaft. Two positive results guarantee clearance. Two negative results indicate interference. A range spanning zero permits either condition. Choose the fit from the required motion, assembly method, operating temperature and inspection capability.',
    'Specify the nominal size and tolerance class on the drawing. For bearing seats, keys and precision locating features, check the component maker’s requirements alongside the ISO limits.',
  ),
  'kama-kanali-hesaplama-mil-capina-gore-kama-olcusu': guide(
    'How to Size a Shaft Key and Keyway',
    'Select a standard key cross-section from the shaft diameter and check the connection against the transmitted torque.',
    'For a parallel key, use the shaft diameter to select the width and height from the relevant table, such as DIN 6885. The depth in the shaft and the depth in the hub are different dimensions. Specify both on their respective drawings along with width tolerance, key length and end shape.',
    'Convert transmitted torque to tangential force at the shaft radius. Use the effective key length for shear and contact-pressure checks. Also check hub wall thickness, fatigue at the shaft keyway corners, and the fit needed for assembly or sliding.',
  ),
  'kilavuz-matkap-capi-nasil-hesaplanir-metrik-dis-tablosu': guide(
    'How to Calculate a Metric Tap Drill Size',
    'Find an initial cutting-tap drill diameter from the nominal diameter and thread pitch.',
    'A useful approximation for metric cutting taps is D − P. For M10 × 1.5, this gives 8.5 mm. Common coarse examples are M8 × 1.25 with a 6.8 mm drill and M12 × 1.75 with a 10.2 mm drill. Select the available drill using the tooling chart and the required thread class.',
    'A form tap needs a different pilot diameter. For blind holes, distinguish required full thread depth from pilot drill depth and include room for the tap lead, chip evacuation and the drill point.',
  ),
  'teknik-resimde-yuzey-puruzlulugu-ra-rz-nedir': guide(
    'Ra and Rz Surface Roughness on Engineering Drawings',
    'Understand roughness parameters and pick a drawing requirement that fits the function of the surface.',
    'Ra describes the arithmetic mean of profile deviations from the center line. Rz describes profile height using the evaluation procedure specified by the applicable standard. Two surfaces can have the same Ra and different peak-to-valley behavior. A conversion factor cannot capture that difference reliably.',
    'Choose the parameter and limit from service needs such as sealing, sliding wear or interference fit. Place the surface texture symbol on the controlled face. Include the measurement conditions or process requirements where necessary and use the same specification for production and inspection.',
  ),
  'm6-kilavuz-matkap-capi-kac-mm': tapDrill('M6', '1.0', '5.0', 'M6 × 0.75 with an approximately 5.2 mm drill'),
  'm8-kilavuz-matkap-capi-kac-mm': tapDrill('M8', '1.25', '6.8', 'M8 × 1.0 with an approximately 7.0 mm drill'),
  'm10-kilavuz-matkap-capi-kac-mm': tapDrill('M10', '1.5', '8.5', 'M10 × 1.25 with an approximately 8.8 mm drill'),
  'm12-kilavuz-matkap-capi-kac-mm': tapDrill('M12', '1.75', '10.2', 'M12 × 1.5 at 10.5 mm and M12 × 1.25 at approximately 10.8 mm'),
  'm16-kilavuz-matkap-capi-kac-mm': tapDrill('M16', '2.0', '14.0', 'M16 × 1.5 with an approximately 14.5 mm drill'),
  'm20-kilavuz-matkap-capi-kac-mm': tapDrill('M20', '2.5', '17.5', 'M20 × 2.0 at 18.0 mm and M20 × 1.5 at 18.5 mm'),
  'm30-hatve-kilavuz-matkap-capi': tapDrill('M30', '3.5', '26.5', 'M30 × 2.0 with an approximately 28.0 mm drill'),
  'h7-tolerans-tablosu-nasil-okunur': guide(
    'How to Read an H7 Hole Tolerance Table',
    'Locate the nominal diameter range, then convert the table deviations to drawing limits.',
    'H identifies a hole whose lower deviation is zero. Grade 7 supplies the tolerance width for the diameter interval. Find the correct interval in the table and verify which endpoint belongs to each row. If the table is in micrometers, convert the deviation to millimeters before adding it to the nominal diameter.',
    'An H7 designation controls the hole alone. The shaft limits determine whether the assembly clears, transitions, or interferes. Check both limits and match the gauge method to the tolerance and part geometry.',
  ),
  'rulman-yatagi-toleransi-nasil-secilir': guide(
    'How to Choose a Rolling Bearing Seat Fit',
    'Select shaft and housing tolerances from the bearing load direction, mounting method and operating conditions.',
    'Identify whether the load rotates relative to each ring. A ring under a rotating load generally needs more support against creep than one under a stationary load. Start with the manufacturer’s fit table for the bearing type, ring size and load intensity.',
    'Interference and temperature differences can reduce bearing internal clearance. Check working clearance, housing stiffness, roundness, surface finish, and the shoulder radius before detailing the seat. Large temperature changes and thin housings need separate verification.',
  ),
  'civata-sikma-torku-nasil-hesaplanir': guide(
    'How to Estimate Bolt Tightening Torque',
    'Relate torque to target preload, nominal bolt diameter and friction assumptions.',
    'The preliminary relation T ≈ K × F × d uses target clamp force F, nominal diameter d and a nut factor K. Keep units consistent. Most applied torque is spent overcoming friction, so coating, lubricant and mating surface condition can alter clamp force substantially.',
    'Choose the target preload from joint and fastener limits. For a critical joint, use approved tightening data or verify clamp force with a representative joint test. Record lubrication, tightening sequence and the tool accuracy in the assembly instruction.',
  ),
  'ra-3-2-yuzey-puruzlulugu-ne-demek': guide(
    'What Does Ra 3.2 Mean on a Drawing?',
    'Ra 3.2 specifies an arithmetic average profile roughness of 3.2 µm under the applicable evaluation conditions.',
    'Ra summarizes the profile over the evaluation length. It measures surface texture, while size tolerance and flatness control different properties. A face can meet one requirement while missing the others.',
    'Apply the symbol to the face where the finish matters. Use the appropriate sampling and filtering conditions for inspection. Choose a tighter finish only where the contact, sealing, appearance or wear requirement justifies it.',
  ),
  'sac-bukum-k-faktoru-nedir': guide(
    'What Is the Sheet Metal Bend K-Factor?',
    'The K-factor locates the neutral axis through the sheet thickness for a bend allowance calculation.',
    'K is the distance from the inside bend surface to the neutral axis divided by sheet thickness. With bend angle θ in radians, inside radius R and thickness t, the bend allowance is θ × (R + Kt). Add allowance to the straight lengths measured to the tangent points.',
    'K depends on the forming process, tooling, radius and material. Use representative test bends to compare measured flat lengths with the model. A verified bend table is more useful in production than a universal K value.',
  ),
  'teknik-resimde-genel-tolerans-nasil-yazilir': guide(
    'How to Specify General Tolerances on a Drawing',
    'Use a drawing-wide tolerance note for ordinary features and individual controls where function requires them.',
    'State the chosen standard and class clearly in the title block or general notes. Scope the note to dimensions with no individual tolerance. Apply explicit fit, size or geometric controls to locating faces, bearing seats and critical interfaces.',
    'Check conflicting notes, unit conventions and the revision of the governing standard before release. Ensure the specified class is measurable and achievable by the intended manufacturing process.',
  ),
  'segman-kanali-olcusu-nasil-belirlenir': guide(
    'How to Specify a Retaining Ring Groove',
    'Choose the ring series first, then take groove dimensions and limits from its standard or manufacturer’s table.',
    'Internal rings fit a bore and external rings fit a shaft. Confirm the series and nominal diameter before choosing groove diameter, width and corner radius. Allow installation access and keep the groove far enough from the end face.',
    'Check both ring and groove capacity. Axial force, impact, the groove material, edge condition and seating can govern the allowable load. Show the applicable groove tolerances and deburring requirement on the drawing.',
  ),
  'kaynak-sembolu-ve-kaynak-notu-nasil-yazilir': guide(
    'How to Write a Weld Symbol and Drawing Note',
    'Communicate the joint, weld type, required size and location through a consistent drawing convention.',
    'Use the drawing’s applicable welding symbol standard. Show arrow-side and other-side welds as specified by that system. For a fillet weld, distinguish throat size from leg length and specify length and pitch for intermittent welds.',
    'Use notes for requirements that the symbol cannot communicate clearly, such as inspection, process restrictions or weld finishing. Keep those notes consistent with the joint detail and welding procedure.',
  ),
  'h7-g6-gecme-nedir-nerede-kullanilir': guide(
    'H7/g6 Clearance Fit: Limits and Applications',
    'H7/g6 pairs a hole at or above nominal with a shaft below nominal to provide controlled clearance.',
    'Read the hole and shaft deviations from the ISO table for the same nominal diameter. Compute minimum clearance using the smallest hole and largest shaft. Use the other two extremes to compute maximum clearance.',
    'H7/g6 is a useful starting point for guided motion or easy assembly when little play is desired. Check thermal growth, dirt, lubrication and misalignment against the minimum clearance before choosing it.',
  ),
  'h7-h6-gecme-nedir-bosluk-ve-montaj': guide(
    'H7/h6 Fit: Clearance and Assembly',
    'H7/h6 can approach line-to-line at maximum material condition, so check actual assembly needs.',
    'The minimum H7 hole and maximum h6 shaft sit at the nominal dimension. Their theoretical minimum diametral clearance is zero. The maximum clearance is the largest hole diameter minus the smallest shaft diameter.',
    'Verify that thermal growth, coating, shape deviation and surface finish leave enough assembly clearance. Consider the full tolerance stack when centering or servicing the assembly.',
  ),
  '90-derece-sac-bukum-acinimi-nasil-hesaplanir': guide(
    'How to Calculate a 90° Sheet Metal Flat Pattern',
    'Use bend allowance with tangent lengths, or bend deduction with outside flange dimensions.',
    'For a 90° bend, the bend allowance is (π / 2) × (R + Kt), where R is inside radius and t is thickness. Add this allowance to dimensions measured to both tangent points. When using outside flange dimensions, apply the corresponding bend deduction instead.',
    'Confirm the actual inside radius, machine setup and material behavior with a test piece. Update the shop bend table using measured results before cutting a batch.',
  ),
  'sac-kalinligina-gore-v-kalip-nasil-secilir': guide(
    'How to Choose a Press Brake V-Die Opening',
    'Choose the opening from thickness, required formed radius, flange support and available press capacity.',
    'A wider V-opening generally reduces forming force and increases the natural inside radius in air bending. A narrower opening supports shorter flanges but increases tooling load and may increase marking. Begin with the tooling maker’s selection table for the material and thickness.',
    'Check the minimum flange, punch radius, bend angle, load per unit length and actual machine and die capacities. An opening that fits the geometry may still be unsuitable for the tool’s rated load.',
  ),
  'm6-m8-m10-m12-civata-torku-nasil-belirlenir': guide(
    'How to Choose Tightening Torque for M6, M8, M10 and M12 Bolts',
    'Match a torque value to thread size, fastener class, target preload and the actual friction condition.',
    'An M-size alone cannot determine torque. Identify thread pitch, strength class and surface condition. If using the approximation T ≈ KFd, choose a target preload appropriate to the fastener and joint, then use a documented nut factor for that hardware condition.',
    'Compare the result with the assembly drawing or fastener supplier’s table. Dry and lubricated values are not interchangeable. Critical joints require a validated procedure, including tool calibration and tightening sequence.',
  ),
  'rulman-l10-omru-nasil-hesaplanir': guide(
    'How to Calculate Bearing L10 Life in Revolutions and Hours',
    'Estimate rolling bearing basic rating life from dynamic load rating, equivalent load and speed.',
    'L10 = (C / P)ᵖ gives life in millions of revolutions under the basic rating model. Use the manufacturer’s equivalent dynamic load P and rating C in the same units. The exponent is 3 for ball bearings and 10/3 for roller bearings.',
    'Multiply millions of revolutions by 1,000,000, then divide by 60 times rpm for constant-speed hours. Use the appropriate duty-cycle model when load or speed varies. Lubrication, contamination, alignment and static load can change the application assessment.',
  ),
  'barlow-formulu-ile-boru-et-kalinligi-hesabi': guide(
    'Preliminary Pipe Wall Thickness with Barlow’s Formula',
    'Use the thin-wall pressure relation for an initial check, then apply the relevant piping design code.',
    'Barlow’s relation links pressure, outside diameter, allowable stress and wall thickness in a simplified hoop-stress model. With consistent units, t ≈ P × D / (2S). Identify which diameter convention and stress basis the applicable standard uses.',
    'Add corrosion and other allowances and account for negative mill tolerance as the governing code requires. Also evaluate joints, temperature, external loads and testing before selecting a pipe schedule.',
  ),
  'torktan-mil-capi-nasil-hesaplanir': guide(
    'How to Estimate Solid Shaft Diameter from Torque',
    'Use the elastic torsion relation for a circular solid shaft and check the rest of the load case separately.',
    'For a round solid shaft under pure torsion, τ = 16T / (πd³). Use torque in N·mm and allowable stress in N/mm² to obtain diameter in millimeters. Round up to a feasible size and verify service torque, including start-up peaks.',
    'Check bending, fatigue, keyways, shoulders, deflection and support geometry independently. A shaft that meets the pure torsion estimate can still fail a combined loading or stiffness requirement.',
  ),
  'disli-modul-dis-sayisi-ve-merkez-mesafesi-hesabi': guide(
    'Spur Gear Module, Tooth Count and Center Distance',
    'Work from the pitch diameter and tooth count for standard unshifted external spur gears.',
    'Pitch diameter d equals module m times tooth count z. For two standard unshifted external spur gears, center distance is (d₁ + d₂) / 2. The ideal speed ratio follows the tooth counts and the two external gears rotate in opposite directions.',
    'Check compatibility of module and pressure angle. Profile shift, backlash, tooth strength, manufacturing quality and bearing alignment require additional design checks.',
  ),
  'o-ring-kanal-olcusu-ve-sikistirma-orani-nasil-secilir': guide(
    'How to Size an O-Ring Groove and Check Squeeze',
    'Choose the seal and groove together for the pressure direction and type of movement.',
    'Identify whether the joint is static or dynamic and whether sealing is axial or radial. Compare the mounted gland height to the ring cross-section. The difference divided by the free cross-section is nominal squeeze.',
    'Use the seal supplier’s tables for squeeze, gland fill, stretch and extrusion clearance. Include groove and seal tolerances, fluid compatibility, temperature and assembly chamfers in the evaluation.',
  ),
  'kablo-kesiti-ve-gerilim-dusumu-birlikte-nasil-hesaplanir': guide(
    'Cable Size and Voltage Drop: How to Check Both',
    'Select a cable by current capacity, then verify voltage drop for conductor material, length and circuit type.',
    'Start from the load current and installation method. Correct ampacity for ambient temperature, grouping and other applicable conditions. Then calculate voltage drop for the actual route length and the appropriate single-phase, three-phase or DC circuit model.',
    'If either check requires a larger conductor, use the larger preliminary size. Verify protection coordination, short-circuit withstand, terminals and the installation standard before release.',
  ),
  'voltaj-dusumu-yuzde-hesabi-ve-kablo-uzunlugu': guide(
    'Voltage Drop Percentage and the Effect of Cable Length',
    'Express voltage drop as a percentage of the supply voltage and check the circuit length convention.',
    'Voltage drop percentage is 100 × ΔV / Vₛ. For a simple DC two-wire circuit, use the round-trip conductor length in the voltage drop calculation, or multiply one-way length by two once. A three-phase AC estimate uses a different relationship.',
    'Longer cables and higher current increase the drop. Larger cross-sections reduce resistance. Consider conductor temperature, material and starting current, then compare against the limit for the complete installation.',
  ),
  'kose-kaynagi-bogaz-kalinligi-nasil-hesaplanir': guide(
    'How to Calculate Fillet Weld Throat Thickness',
    'Distinguish effective throat from weld leg length before calculating weld area.',
    'For an ideal equal-leg 45° fillet, the theoretical throat is approximately 0.707 times the leg size. Use the effective weld length with the design throat to find the resisting area for a simple preliminary load check.',
    'Joint angle, weld profile, loading direction and code requirements can change the effective resistance. Eccentric loading requires a weld group check. Dimension the weld consistently with the selected symbol standard.',
  ),
  'basincli-kap-cidar-kalinligi-on-hesabi': guide(
    'Preliminary Wall Thickness for a Pressure Vessel',
    'Use a shell estimate to understand sensitivity to pressure, diameter, stress and joint efficiency.',
    'A simplified cylindrical-shell model links the required wall thickness to pressure and radius, with allowable stress and joint efficiency in the denominator. It is useful for early sizing under the model’s assumptions.',
    'Use the governing vessel code for final shell, head and nozzle design. Check design temperature, corrosion allowance, thickness tolerance, openings, weld qualification and load combinations. External pressure and vacuum require a separate buckling check.',
  ),
  'pompa-gucu-debi-ve-basma-yuksekliginden-nasil-hesaplanir': guide(
    'How to Calculate Pump Power from Flow and Head',
    'Find hydraulic power and estimate required shaft power at the operating point.',
    'Hydraulic power is ρgQH, using density in kg/m³, flow in m³/s and head in meters. Divide by pump efficiency to estimate shaft power. If estimating electrical input, use motor efficiency separately.',
    'Total head includes the elevation change, relevant pressure difference and line losses at the chosen flow. Verify the duty point, input power curve and operating range using the pump manufacturer’s data.',
  ),
  'oee-nasil-hesaplanir-kullanilabilirlik-performans-kalite': guide(
    'How to Calculate Overall Equipment Effectiveness',
    'OEE combines availability, performance and quality measurements for the same production window.',
    'Availability is run time divided by planned production time. Performance is the ideal cycle time multiplied by total output and divided by run time. Quality is good output divided by total output.',
    'Multiply the three ratios to obtain OEE. Define planned downtime, ideal cycle times and reject counting consistently. Review the largest loss component before comparing shifts or deciding which process to improve.',
  ),
  'giyotin-bicak-boslugu-nasil-ayarlanir': guide(
    'How to Select Guillotine Shear Blade Clearance',
    'Base a shear clearance check on material, thickness, blade condition and the machine maker’s settings.',
    'Start with the published clearance for the actual sheet grade and thickness. Too little clearance can increase force and tool wear. Excessive clearance can worsen burr, rollover and edge quality. Blade condition and alignment can produce similar symptoms.',
    'Follow the machine’s service procedure for checks and adjustment. Verify the cut on representative stock, then check edge condition across the working length. Blade service and setting require the machine manufacturer’s safe maintenance procedure.',
  ),
  'metrik-dis-tablosu-m3-m36-kilavuz-matkap-caplari': guide(
    'Metric Thread Chart: Pitch and Tap Drill Sizes from M3 to M36',
    'Use the metric thread chart to distinguish coarse and fine pitch and find a starting cutting-tap drill.',
    'Select the complete thread designation in the linked chart. M6 × 1.0 commonly starts at 5.0 mm, M8 × 1.25 at 6.8 mm, and M10 × 1.5 at 8.5 mm. Fine threads with the same nominal diameter use a different pitch and often a larger pilot drill.',
    'Confirm the recommendation for the actual tap and material. The tap drill, theoretical minor diameter and bolt clearance drill are separate values. Specify the thread class and full thread depth on the drawing where required.',
  ),
  'dalgic-pompa-hesaplama-debi-basma-yuksekligi-motor-gucu': guide(
    'Submersible Pump Sizing: Flow, Total Head and Motor Power',
    'Calculate the duty point from flow and total dynamic head before comparing pump and motor curves.',
    'Set the required flow from the process or supply demand. Include the difference between the pumping water level and discharge elevation, the required outlet pressure, and pipe, valve and fitting losses at the selected flow.',
    'Use hydraulic power and pump efficiency to estimate shaft power. Check pump curves at the duty point, motor loading throughout the operating range and the manufacturer’s installation requirements.',
  ),
  'konik-hesaplama-buyuk-cap-kucuk-cap-boy-aci': guide(
    'Lathe Taper Calculation: Included Angle, Half Angle and Ratio',
    'Calculate the taper from the difference in diameters over the axial length.',
    'The half angle θ is arctan((D − d) / (2L)), where D is the large diameter, d is the small diameter and L is the axial length between them. The full included angle is 2θ. Confirm which angle the drawing and machine control expect.',
    'For a diametral taper written 1:N, N is L / (D − d). Measure both diameters in planes normal to the axis and use the same unit for all lengths.',
  ),
  'baklavali-sac-agirlik-tablosu-ve-hesaplama': guide(
    'How to Estimate Checker Plate Weight',
    'Calculate base plate mass from area, thickness and density, then account for the raised pattern.',
    'Base plate mass is area × thickness × density in consistent units. Use base thickness rather than total height over the raised pattern. The embossing can change the mass per square meter across suppliers and patterns.',
    'For purchasing or lifting, prefer the supplier’s verified mass per unit area or weigh a representative plate. Multiply by the actual cut area and quantity for the order estimate.',
  ),
  'endustriyel-isi-termal-iletim-hesaplama': guide(
    'Industrial Heat Conduction and Thermal Resistance',
    'Estimate heat transfer through a flat layer from conductivity, area, thickness and temperature difference.',
    'In steady one-dimensional conduction, thermal resistance is L / (kA), in K/W. Heat transfer rate equals the temperature difference divided by total thermal resistance. Add layer resistances in series when the heat crosses each layer in turn.',
    'Real assemblies may also require contact, convection and radiation terms. Use conductivity at representative temperatures and verify assumptions such as constant area and uniform boundary conditions.',
  ),
  'pap-burc-olculeri-ptfe-pom-farki': guide(
    'PAP Bushings: Dimensions, PTFE vs POM and Installation',
    'Read wrapped bushing dimensions and verify the lining, lubrication conditions and installed clearance.',
    'A 20 × 22 × 20 mm bushing has a nominal 20 mm bore, 22 mm outside diameter and 20 mm length. Its nominal wall thickness is 1 mm. Match the complete manufacturer part number to the catalog before comparing load limits or specifying a substitute.',
    'Steel-backed PTFE composites may be intended for dry sliding. POM composites commonly require initial lubrication. Use the individual product data to assess permissible pressure, velocity, PV, temperature and counterface finish. Steel grade alone does not specify shaft hardness or roughness.',
    'The bushing usually stays fixed in the housing while sliding occurs at the shaft interface. Use the bore limits after press fitting. Subtract the largest shaft from the smallest installed bore for minimum diametral clearance, and reverse the extremes for maximum clearance.',
  ),
  'agir-yuk-burcu-5-ton-salinimli-mafsal': guide(
    'Sizing a Heavy-Duty Bushing for a 5 Tonne-Force Pivot',
    'Estimate projected pressure and sliding speed for a 20 mm shaft with an oscillating radial load.',
    'A peak radial load of 5 tonne-force is 49.03 kN. At a 20 mm bore and 20 mm effective length, the projected area is 400 mm² and nominal pressure is 122.6 MPa. At 15 mm and 25 mm effective lengths it is approximately 163.4 MPa and 98.1 MPa, respectively.',
    'A 45° movement between endpoints covers 90° in one full out-and-back cycle. At 14 cycles per minute, average sliding speed is about 0.00367 m/s and PV is 0.449 MPa·m/s at constant peak pressure. Including only one second of motion per cycle raises the motion-average PV to about 1.93 MPa·m/s.',
    'Compare the pressure acting during motion and the speed at that point against the chosen product’s catalog limits. Edge loading and shaft deflection can raise local pressure. Use representative cycling and clearance measurements to verify a wear-life target.',
  ),
};

export function getEnglishGuide(slug: string): EnglishGuide | undefined {
  return englishGuides[slug];
}
