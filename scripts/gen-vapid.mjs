// VAPID キーを生成するスクリプト
// 使い方: node scripts/gen-vapid.mjs
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("\n=== VAPID Keys ===");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("\n.env.local と Vercel 環境変数の両方に追加してください。");
