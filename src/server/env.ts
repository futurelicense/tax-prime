export function serverEnv() {
  return {
    groqKey: process.env.GROQ_API_KEY?.trim() ?? '',
    groqModel: process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile',
    fredKey: process.env.FRED_API_KEY?.trim() ?? '',
    fredSeries: process.env.FRED_SERIES?.trim() || 'GDP',
    treasuryFromYear: Math.min(
      2030,
      Math.max(2000, Number(process.env.TREASURY_FROM_YEAR) || 2018),
    ),
  }
}