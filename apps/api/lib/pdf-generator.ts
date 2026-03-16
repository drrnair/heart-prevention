/**
 * PDF report generation using @react-pdf/renderer.
 *
 * Generates a multi-page cardiovascular health report with risk scores,
 * lab values, body metrics, and lifestyle plan summary.
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ReportData {
  readonly userName?: string;
  readonly reportDate: string;
  readonly dataLevel: number;
  readonly riskScores: ReadonlyArray<{
    readonly scoreType: string;
    readonly scoreValue: number;
    readonly riskCategory: string;
  }>;
  readonly labValues?: Readonly<Record<string, number | null>>;
  readonly assessment?: {
    readonly bmi?: number;
    readonly waistToHip?: number;
    readonly waistToHeight?: number;
    readonly systolicBp?: number;
    readonly diastolicBp?: number;
  };
  readonly lifestylePlan?: {
    readonly targets?: Readonly<Record<string, string>>;
    readonly nutritionPriorities?: readonly string[];
    readonly exerciseSummary?: string;
  };
  readonly disclaimer: string;
}

/** Legacy input shape used by the route handler. */
export interface PdfGenerationInput {
  readonly profile: Record<string, unknown>;
  readonly scores: Record<string, unknown> | Record<string, unknown>[];
  readonly labs: Record<string, unknown> | Record<string, unknown>[];
  readonly lifestyle: Record<string, unknown> | null;
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const ACCENT = '#DC2626';
const ACCENT_LIGHT = '#FEE2E2';
const GRAY_50 = '#F9FAFB';
const GRAY_200 = '#E5E7EB';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 70,
    paddingHorizontal: 40,
    color: GRAY_800,
  },
  /* Cover */
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 12,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 14,
    color: GRAY_500,
    marginBottom: 6,
    textAlign: 'center',
  },
  coverBadge: {
    marginTop: 24,
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  coverBadgeText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    textAlign: 'center',
  },
  /* Section headings */
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_800,
    marginTop: 14,
    marginBottom: 6,
  },
  /* Tables */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: GRAY_50,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: GRAY_200,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 9,
    color: GRAY_800,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_500,
  },
  /* Labels */
  preliminaryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  preliminaryText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
  },
  /* Metric blocks */
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricBlock: {
    width: '30%',
    backgroundColor: GRAY_50,
    borderRadius: 6,
    padding: 10,
  },
  metricLabel: {
    fontSize: 8,
    color: GRAY_500,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_800,
  },
  metricInterpretation: {
    fontSize: 8,
    color: GRAY_500,
    marginTop: 2,
  },
  /* Bullet list */
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
    marginTop: 4,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 10,
    color: GRAY_800,
    flex: 1,
  },
  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
  },
  footerDivider: {
    borderTopWidth: 0.5,
    borderTopColor: GRAY_200,
    marginBottom: 6,
  },
  footerDisclaimer: {
    fontSize: 7,
    color: GRAY_500,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  footerBranding: {
    fontSize: 7,
    color: GRAY_500,
    textAlign: 'center',
  },
  pageNumber: {
    fontSize: 7,
    color: GRAY_500,
    textAlign: 'right',
    marginTop: 2,
  },
  bodyText: {
    fontSize: 10,
    color: GRAY_800,
    lineHeight: 1.5,
  },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DATA_LEVEL_DESCRIPTIONS: Readonly<Record<number, string>> = {
  1: 'Preliminary — based on demographics only',
  2: 'Basic — demographics + vitals',
  3: 'Standard — demographics, vitals + basic labs',
  4: 'Comprehensive — full lab panel included',
};

const LAB_CATEGORIES: ReadonlyArray<{
  readonly title: string;
  readonly keys: readonly string[];
}> = [
  {
    title: 'Lipid Panel',
    keys: ['total_cholesterol', 'ldl', 'hdl', 'triglycerides', 'non_hdl', 'vldl', 'tc_hdl_ratio', 'apoB', 'lpa'],
  },
  {
    title: 'Glycemic Markers',
    keys: ['fasting_glucose', 'hba1c', 'fasting_insulin', 'homa_ir'],
  },
  {
    title: 'Inflammatory Markers',
    keys: ['hs_crp', 'homocysteine', 'fibrinogen'],
  },
  {
    title: 'Renal & Hepatic',
    keys: ['creatinine', 'egfr', 'alt', 'ast', 'uric_acid', 'albumin'],
  },
  {
    title: 'Thyroid',
    keys: ['tsh', 'free_t4'],
  },
  {
    title: 'Other',
    keys: ['vitamin_d', 'ferritin', 'cbc_wbc', 'cbc_platelets'],
  },
];

const LAB_REFERENCE: Readonly<Record<string, { readonly label: string; readonly unit: string; readonly range: string }>> = {
  total_cholesterol: { label: 'Total Cholesterol', unit: 'mg/dL', range: '<200' },
  ldl: { label: 'LDL Cholesterol', unit: 'mg/dL', range: '<100' },
  hdl: { label: 'HDL Cholesterol', unit: 'mg/dL', range: '>40' },
  triglycerides: { label: 'Triglycerides', unit: 'mg/dL', range: '<150' },
  non_hdl: { label: 'Non-HDL', unit: 'mg/dL', range: '<130' },
  vldl: { label: 'VLDL', unit: 'mg/dL', range: '<30' },
  tc_hdl_ratio: { label: 'TC/HDL Ratio', unit: '', range: '<5.0' },
  apoB: { label: 'ApoB', unit: 'mg/dL', range: '<90' },
  lpa: { label: 'Lp(a)', unit: 'nmol/L', range: '<75' },
  fasting_glucose: { label: 'Fasting Glucose', unit: 'mg/dL', range: '70-99' },
  hba1c: { label: 'HbA1c', unit: '%', range: '<5.7' },
  fasting_insulin: { label: 'Fasting Insulin', unit: 'mIU/L', range: '2-25' },
  homa_ir: { label: 'HOMA-IR', unit: '', range: '<2.0' },
  hs_crp: { label: 'hs-CRP', unit: 'mg/L', range: '<1.0' },
  homocysteine: { label: 'Homocysteine', unit: 'umol/L', range: '<10' },
  fibrinogen: { label: 'Fibrinogen', unit: 'mg/dL', range: '200-400' },
  creatinine: { label: 'Creatinine', unit: 'mg/dL', range: '0.7-1.3' },
  egfr: { label: 'eGFR', unit: 'mL/min', range: '>60' },
  alt: { label: 'ALT', unit: 'U/L', range: '<40' },
  ast: { label: 'AST', unit: 'U/L', range: '<40' },
  uric_acid: { label: 'Uric Acid', unit: 'mg/dL', range: '3.5-7.2' },
  albumin: { label: 'Albumin', unit: 'g/dL', range: '3.5-5.5' },
  tsh: { label: 'TSH', unit: 'mIU/L', range: '0.4-4.0' },
  free_t4: { label: 'Free T4', unit: 'ng/dL', range: '0.8-1.8' },
  vitamin_d: { label: 'Vitamin D', unit: 'ng/mL', range: '30-100' },
  ferritin: { label: 'Ferritin', unit: 'ng/mL', range: '30-400' },
  cbc_wbc: { label: 'WBC', unit: 'K/uL', range: '4.5-11.0' },
  cbc_platelets: { label: 'Platelets', unit: 'K/uL', range: '150-400' },
};

function getBmiInterpretation(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function getWhrInterpretation(whr: number): string {
  if (whr < 0.9) return 'Low risk';
  if (whr < 1.0) return 'Moderate risk';
  return 'High risk';
}

function getWhtRInterpretation(whtr: number): string {
  if (whtr < 0.5) return 'Low risk';
  if (whtr < 0.6) return 'Moderate risk';
  return 'High risk';
}

function getBpClassification(sys: number, dia: number): string {
  if (sys < 120 && dia < 80) return 'Normal';
  if (sys < 130 && dia < 80) return 'Elevated';
  if (sys < 140 || dia < 90) return 'Stage 1 Hypertension';
  return 'Stage 2 Hypertension';
}

function isValueOutOfRange(key: string, value: number): boolean {
  const ref = LAB_REFERENCE[key];
  if (!ref) return false;
  const range = ref.range;
  if (range.startsWith('<')) {
    return value >= parseFloat(range.slice(1));
  }
  if (range.startsWith('>')) {
    return value <= parseFloat(range.slice(1));
  }
  const [low, high] = range.split('-').map(Number);
  if (low != null && high != null) {
    return value < low || value > high;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/*  React-PDF Components                                               */
/* ------------------------------------------------------------------ */

function PageFooter({
  disclaimer,
  pageNum,
}: {
  readonly disclaimer: string;
  readonly pageNum: number;
}): React.ReactElement {
  return React.createElement(
    View,
    { style: styles.footer, fixed: true },
    React.createElement(View, { style: styles.footerDivider }),
    React.createElement(Text, { style: styles.footerDisclaimer }, disclaimer),
    React.createElement(
      Text,
      { style: styles.footerBranding },
      'Generated by Heart Prevention \u2014 For educational purposes only',
    ),
    React.createElement(Text, { style: styles.pageNumber }, `Page ${pageNum}`),
  );
}

function CoverPage({ data }: { readonly data: ReportData }): React.ReactElement {
  const levelDesc = DATA_LEVEL_DESCRIPTIONS[data.dataLevel] ?? `Level ${data.dataLevel}`;

  return React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(
      View,
      { style: styles.coverContainer },
      React.createElement(Text, { style: styles.coverTitle }, 'Cardiovascular Health Report'),
      React.createElement(
        Text,
        { style: styles.coverSubtitle },
        data.userName ?? 'Patient Report',
      ),
      React.createElement(
        Text,
        { style: styles.coverSubtitle },
        `Report Date: ${data.reportDate}`,
      ),
      React.createElement(
        View,
        { style: styles.coverBadge },
        React.createElement(
          Text,
          { style: styles.coverBadgeText },
          `Level ${data.dataLevel} \u2014 ${levelDesc.split('\u2014')[1]?.trim() ?? ''}`,
        ),
      ),
    ),
    React.createElement(PageFooter, { disclaimer: data.disclaimer, pageNum: 1 }),
  );
}

function RiskScorePage({ data }: { readonly data: ReportData }): React.ReactElement {
  const modifiable = ['LDL', 'HDL', 'Triglycerides', 'Blood Pressure', 'Smoking', 'BMI', 'Diabetes'];
  const nonModifiable = ['Age', 'Sex', 'Family History', 'Ethnicity'];

  return React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(Text, { style: styles.sectionTitle }, 'Risk Score Summary'),
    data.dataLevel === 1
      ? React.createElement(
          View,
          { style: styles.preliminaryBadge },
          React.createElement(Text, { style: styles.preliminaryText }, 'PRELIMINARY'),
        )
      : null,
    /* Score table */
    React.createElement(
      View,
      { style: styles.tableHeader },
      React.createElement(Text, { style: { ...styles.tableHeaderCell, width: '40%' } }, 'Score Type'),
      React.createElement(Text, { style: { ...styles.tableHeaderCell, width: '30%' } }, 'Value'),
      React.createElement(Text, { style: { ...styles.tableHeaderCell, width: '30%' } }, 'Risk Category'),
    ),
    ...data.riskScores.map((score, i) =>
      React.createElement(
        View,
        { key: i, style: styles.tableRow },
        React.createElement(Text, { style: { ...styles.tableCell, width: '40%' } }, score.scoreType),
        React.createElement(
          Text,
          { style: { ...styles.tableCell, width: '30%' } },
          `${score.scoreValue.toFixed(1)}%`,
        ),
        React.createElement(
          Text,
          { style: { ...styles.tableCell, width: '30%', fontFamily: 'Helvetica-Bold' } },
          score.riskCategory,
        ),
      ),
    ),
    /* Risk factors */
    React.createElement(Text, { style: styles.subsectionTitle }, 'Modifiable Risk Factors'),
    ...modifiable.map((f) =>
      React.createElement(
        View,
        { key: f, style: styles.bulletRow },
        React.createElement(View, { style: styles.bulletDot }),
        React.createElement(Text, { style: styles.bulletText }, f),
      ),
    ),
    React.createElement(Text, { style: styles.subsectionTitle }, 'Non-Modifiable Risk Factors'),
    ...nonModifiable.map((f) =>
      React.createElement(
        View,
        { key: f, style: styles.bulletRow },
        React.createElement(View, { style: styles.bulletDot }),
        React.createElement(Text, { style: styles.bulletText }, f),
      ),
    ),
    React.createElement(PageFooter, { disclaimer: data.disclaimer, pageNum: 2 }),
  );
}

function LabValuesPage({ data }: { readonly data: ReportData }): React.ReactElement | null {
  if (!data.labValues) return null;

  const sections: React.ReactElement[] = [];
  let hasAnyData = false;

  for (const category of LAB_CATEGORIES) {
    const rows: React.ReactElement[] = [];
    for (const key of category.keys) {
      const val = data.labValues[key];
      if (val == null) continue;
      const ref = LAB_REFERENCE[key];
      if (!ref) continue;
      const outOfRange = isValueOutOfRange(key, val);
      rows.push(
        React.createElement(
          View,
          { key, style: styles.tableRow },
          React.createElement(Text, { style: { ...styles.tableCell, width: '28%' } }, ref.label),
          React.createElement(
            Text,
            { style: { ...styles.tableCell, width: '18%', fontFamily: 'Helvetica-Bold' } },
            String(val),
          ),
          React.createElement(Text, { style: { ...styles.tableCell, width: '14%' } }, ref.unit),
          React.createElement(Text, { style: { ...styles.tableCell, width: '20%' } }, ref.range),
          React.createElement(
            Text,
            {
              style: {
                ...styles.tableCell,
                width: '20%',
                fontFamily: 'Helvetica-Bold',
                color: outOfRange ? ACCENT : '#22C55E',
              },
            },
            outOfRange ? 'Out of Range' : 'Normal',
          ),
        ),
      );
    }
    if (rows.length === 0) continue;
    hasAnyData = true;

    sections.push(
      React.createElement(
        View,
        { key: category.title },
        React.createElement(Text, { style: styles.subsectionTitle }, category.title),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: { ...styles.tableHeaderCell, width: '28%' } }, 'Test'),
          React.createElement(Text, { style: { ...styles.tableHeaderCell, width: '18%' } }, 'Value'),
          React.createElement(Text, { style: { ...styles.tableHeaderCell, width: '14%' } }, 'Unit'),
          React.createElement(Text, { style: { ...styles.tableHeaderCell, width: '20%' } }, 'Ref. Range'),
          React.createElement(Text, { style: { ...styles.tableHeaderCell, width: '20%' } }, 'Status'),
        ),
        ...rows,
      ),
    );
  }

  if (!hasAnyData) return null;

  return React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(Text, { style: styles.sectionTitle }, 'Lab Values'),
    ...sections,
    React.createElement(PageFooter, { disclaimer: data.disclaimer, pageNum: 3 }),
  );
}

function BodyMetricsPage({ data }: { readonly data: ReportData }): React.ReactElement | null {
  const a = data.assessment;
  if (!a) return null;

  const metrics: React.ReactElement[] = [];

  if (a.bmi != null) {
    metrics.push(
      React.createElement(
        View,
        { key: 'bmi', style: styles.metricBlock },
        React.createElement(Text, { style: styles.metricLabel }, 'BMI'),
        React.createElement(Text, { style: styles.metricValue }, a.bmi.toFixed(1)),
        React.createElement(Text, { style: styles.metricInterpretation }, getBmiInterpretation(a.bmi)),
      ),
    );
  }

  if (a.waistToHip != null) {
    metrics.push(
      React.createElement(
        View,
        { key: 'whr', style: styles.metricBlock },
        React.createElement(Text, { style: styles.metricLabel }, 'Waist-to-Hip Ratio'),
        React.createElement(Text, { style: styles.metricValue }, a.waistToHip.toFixed(2)),
        React.createElement(Text, { style: styles.metricInterpretation }, getWhrInterpretation(a.waistToHip)),
      ),
    );
  }

  if (a.waistToHeight != null) {
    metrics.push(
      React.createElement(
        View,
        { key: 'whtr', style: styles.metricBlock },
        React.createElement(Text, { style: styles.metricLabel }, 'Waist-to-Height Ratio'),
        React.createElement(Text, { style: styles.metricValue }, a.waistToHeight.toFixed(2)),
        React.createElement(Text, { style: styles.metricInterpretation }, getWhtRInterpretation(a.waistToHeight)),
      ),
    );
  }

  const bpElements: React.ReactElement[] = [];
  if (a.systolicBp != null && a.diastolicBp != null) {
    bpElements.push(
      React.createElement(Text, { key: 'bp-title', style: styles.subsectionTitle }, 'Blood Pressure'),
      React.createElement(
        View,
        { key: 'bp-block', style: { ...styles.metricBlock, width: '40%' } },
        React.createElement(Text, { style: styles.metricLabel }, 'Latest Reading'),
        React.createElement(
          Text,
          { style: styles.metricValue },
          `${a.systolicBp}/${a.diastolicBp} mmHg`,
        ),
        React.createElement(
          Text,
          { style: styles.metricInterpretation },
          getBpClassification(a.systolicBp, a.diastolicBp),
        ),
      ),
    );
  }

  return React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(Text, { style: styles.sectionTitle }, 'Body Metrics & Vitals'),
    React.createElement(View, { style: styles.metricRow }, ...metrics),
    ...bpElements,
    React.createElement(PageFooter, { disclaimer: data.disclaimer, pageNum: 4 }),
  );
}

function LifestylePlanPage({ data }: { readonly data: ReportData }): React.ReactElement | null {
  const lp = data.lifestylePlan;
  if (!lp) return null;

  const elements: React.ReactElement[] = [];

  if (lp.targets && Object.keys(lp.targets).length > 0) {
    elements.push(
      React.createElement(Text, { key: 'targets-title', style: styles.subsectionTitle }, 'Key Targets'),
    );
    for (const [k, v] of Object.entries(lp.targets)) {
      elements.push(
        React.createElement(
          View,
          { key: `target-${k}`, style: styles.bulletRow },
          React.createElement(View, { style: styles.bulletDot }),
          React.createElement(Text, { style: styles.bulletText }, `${k}: ${v}`),
        ),
      );
    }
  }

  if (lp.nutritionPriorities && lp.nutritionPriorities.length > 0) {
    elements.push(
      React.createElement(
        Text,
        { key: 'nutr-title', style: styles.subsectionTitle },
        'Top Nutrition Priorities',
      ),
    );
    for (const [i, item] of lp.nutritionPriorities.entries()) {
      elements.push(
        React.createElement(
          View,
          { key: `nutr-${i}`, style: styles.bulletRow },
          React.createElement(View, { style: styles.bulletDot }),
          React.createElement(Text, { style: styles.bulletText }, item),
        ),
      );
    }
  }

  if (lp.exerciseSummary) {
    elements.push(
      React.createElement(Text, { key: 'ex-title', style: styles.subsectionTitle }, 'Exercise Summary'),
      React.createElement(Text, { key: 'ex-body', style: styles.bodyText }, lp.exerciseSummary),
    );
  }

  if (elements.length === 0) return null;

  return React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(Text, { style: styles.sectionTitle }, 'Lifestyle Plan Summary'),
    ...elements,
    React.createElement(PageFooter, { disclaimer: data.disclaimer, pageNum: 5 }),
  );
}

function HealthReportDocument({ data }: { readonly data: ReportData }): React.ReactElement {
  return React.createElement(
    Document,
    { title: 'Cardiovascular Health Report', author: 'Heart Prevention' },
    React.createElement(CoverPage, { data }),
    React.createElement(RiskScorePage, { data }),
    React.createElement(LabValuesPage, { data }),
    React.createElement(BodyMetricsPage, { data }),
    React.createElement(LifestylePlanPage, { data }),
  );
}

/* ------------------------------------------------------------------ */
/*  Data transformation                                                */
/* ------------------------------------------------------------------ */

function transformInput(input: PdfGenerationInput): ReportData {
  const profile = input.profile;
  const scoresArray = Array.isArray(input.scores) ? input.scores : [input.scores];
  const labsArray = Array.isArray(input.labs) ? input.labs : [input.labs];

  const riskScores = scoresArray.map((s) => ({
    scoreType: String(s.score_type ?? s.scoreType ?? 'Unknown'),
    scoreValue: Number(s.score_value ?? s.scoreValue ?? 0),
    riskCategory: String(s.risk_category ?? s.riskCategory ?? 'Unknown'),
  }));

  const labValues: Record<string, number | null> = {};
  for (const lab of labsArray) {
    const extracted = lab.extracted_values ?? lab.extractedValues;
    if (extracted && typeof extracted === 'object') {
      for (const [k, v] of Object.entries(extracted as Record<string, unknown>)) {
        if (typeof v === 'number') {
          labValues[k] = v;
        }
      }
    }
  }

  const assessment = profile.latest_assessment
    ? {
        bmi: typeof (profile.latest_assessment as Record<string, unknown>).bmi === 'number'
          ? (profile.latest_assessment as Record<string, unknown>).bmi as number
          : undefined,
        waistToHip: typeof (profile.latest_assessment as Record<string, unknown>).waist_to_hip === 'number'
          ? (profile.latest_assessment as Record<string, unknown>).waist_to_hip as number
          : undefined,
        waistToHeight: typeof (profile.latest_assessment as Record<string, unknown>).waist_to_height === 'number'
          ? (profile.latest_assessment as Record<string, unknown>).waist_to_height as number
          : undefined,
        systolicBp: typeof (profile.latest_assessment as Record<string, unknown>).systolic_bp === 'number'
          ? (profile.latest_assessment as Record<string, unknown>).systolic_bp as number
          : undefined,
        diastolicBp: typeof (profile.latest_assessment as Record<string, unknown>).diastolic_bp === 'number'
          ? (profile.latest_assessment as Record<string, unknown>).diastolic_bp as number
          : undefined,
      }
    : undefined;

  const lifestyle = input.lifestyle;
  const lifestylePlan = lifestyle
    ? {
        targets: (lifestyle.targets ?? {}) as Record<string, string>,
        nutritionPriorities: (lifestyle.nutrition_priorities ?? lifestyle.nutritionPriorities ?? []) as string[],
        exerciseSummary: (lifestyle.exercise_summary ?? lifestyle.exerciseSummary ?? '') as string,
      }
    : undefined;

  const dataLevel = typeof profile.data_level === 'number' ? profile.data_level : 1;

  return {
    userName: typeof profile.full_name === 'string'
      ? profile.full_name
      : typeof profile.email === 'string'
        ? profile.email
        : undefined,
    reportDate: new Date().toISOString().split('T')[0] ?? '',
    dataLevel: dataLevel as number,
    riskScores,
    labValues: Object.keys(labValues).length > 0 ? labValues : undefined,
    assessment,
    lifestylePlan,
    disclaimer:
      'This app is for educational and wellness purposes only. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult your healthcare provider for medical decisions.',
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Generate a comprehensive health report as a PDF buffer.
 *
 * @param input - Profile, scores, labs, and lifestyle data
 * @returns PDF file as a Buffer
 */
export async function generateHealthReport(
  input: PdfGenerationInput,
): Promise<Buffer> {
  const data = transformInput(input);
  const doc = React.createElement(
    Document,
    { title: 'Cardiovascular Health Report', author: 'Heart Prevention' },
    React.createElement(CoverPage, { data }),
    React.createElement(RiskScorePage, { data }),
    React.createElement(LabValuesPage, { data }),
    React.createElement(BodyMetricsPage, { data }),
    React.createElement(LifestylePlanPage, { data }),
  );
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
