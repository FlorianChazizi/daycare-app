const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function main() {
  const schoolId = "ntintit";               // change per school, this becomes the tenant ID
  const schoolName = "Ntintit Daycare";
  const adminEmail = "owner@ntintit.example.com";
  const adminPassword = "TempPassword123!"; // tell them to change it after first login

  await admin.firestore().collection("schools").doc(schoolId).set({
    name: schoolName,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const userRecord = await admin.auth().createUser({ email: adminEmail, password: adminPassword });
  await admin.auth().setCustomUserClaims(userRecord.uid, { role: "admin", schoolId });

  console.log(`Created school "${schoolId}" — admin login: ${adminEmail} / ${adminPassword}`);
}

main();