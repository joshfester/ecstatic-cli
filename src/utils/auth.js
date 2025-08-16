const VALID_API_KEYS = [
  'e1c48a6e-9a86-497c-a711-c8ba91e6445a',
  'test_a7f00daf-50da-49dd-b4ef-c46e1e3eda53',
  'dev_e5208437-a659-42e7-9dae-6adc4450e148'
];

export function validateApiKey() {
  const apiKey = process.env.ECSTATIC_API_KEY;

  if (!apiKey) {
    console.error('Error: ECSTATIC_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!VALID_API_KEYS.includes(apiKey)) {
    console.error('Error: Invalid API key');
    process.exit(1);
  }
}