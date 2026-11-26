/**
 * Gera as chaves VAPID para o servidor de push notifications.
 * Execute UMA VEZ: node scripts/generate-vapid-keys.js
 * Depois cole as chaves no seu .env
 */
const webpush = require("web-push");

const keys = webpush.generateVAPIDKeys();

console.log("\n✅ Chaves VAPID geradas com sucesso!\n");
console.log("Copie para o seu .env:\n");
console.log(`VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${keys.privateKey}"`);
console.log(`VAPID_EMAIL="admin@agenda-e-dolphin.com"`);
console.log("\n⚠️  Guarde a VAPID_PRIVATE_KEY em segurança. Nunca suba no Git!\n");
