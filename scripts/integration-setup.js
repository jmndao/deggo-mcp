/**
 * Integration test setup
 * Checks if integration test credentials are available
 */

module.exports = async () => {
  require("dotenv").config({ path: ".env.test" });

  const hasOrangeCredentials =
    process.env.ORANGE_API_KEY &&
    process.env.ORANGE_CLIENT_ID &&
    process.env.ORANGE_CLIENT_SECRET;

  const hasWaveCredentials = process.env.WAVE_API_KEY;

  if (!hasOrangeCredentials && !hasWaveCredentials) {
    console.log(
      "⚠️  No integration test credentials found. Skipping integration tests."
    );
    console.log("   To run integration tests, add credentials to .env.test");
    process.exit(0);
  }

  console.log("🔧 Integration test credentials found");
};
