export async function validateApiKey() {
  const apiKey = process.env.ECSTATIC_API_KEY;

  if (!apiKey) {
    console.error("Error: ECSTATIC_API_KEY environment variable is required");
    process.exit(1);
  }

  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(3000),
    });

    if (response.status === 401) {
      console.error("Error: Invalid API key");
      process.exit(1);
    }

    if (!response.ok) {
      console.error(`Error: Authentication API returned ${response.status}`);
      process.exit(1);
    }
  } catch (error) {
    if (error.name === "TimeoutError") {
      console.error("Error: Authentication API timeout");
    } else if (error.code === "ECONNREFUSED") {
      console.error("Error: Could not connect to authentication API");
    } else {
      console.error(`Error: Authentication failed - ${error.message}`);
    }
    process.exit(1);
  }
}
