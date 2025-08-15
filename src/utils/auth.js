const VALID_API_KEYS = [
  'ecstatic_prod_key_abc123',
  'ecstatic_test_key_def456',
  'ecstatic_dev_josh_xyz789'
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