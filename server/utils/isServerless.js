/**
 * True when running inside a serverless platform (Vercel, AWS Lambda, etc.).
 */
const isServerless = () =>
  process.env.VERCEL === "1" ||
  !!process.env.VERCEL_ENV ||
  !!process.env.AWS_LAMBDA_FUNCTION_NAME;

export default isServerless;
