const requiredEnv = [
  "MONGO_URI",
  "PORT",
  "JWT_SECRET",
  "RESEND_API_KEY",
  "STRIPE_SECRET"
];

function checkEnv() {
  const missing = [];
  for (const env of requiredEnv) {
    if (!process.env[env]) {
      missing.push(env);
    }
  }

  if (missing.length > 0) {
    console.error("\n❌ ERROR: Missing required environment variables in .env:\n");
    missing.forEach((m) => console.error(`  - ${m}`));
    console.error("\nPlease add them to pickfresh-server/.env and restart the server.\n");
    process.exit(1);
  }
}

module.exports = checkEnv;
