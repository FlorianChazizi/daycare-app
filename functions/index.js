const { onCall, HttpsError } = require("firebase-functions/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

const bootstrapSecret = defineSecret("BOOTSTRAP_SECRET");

exports.createStaffAccount = onCall(async (request) => {
  const caller = request.auth;
  if (!caller || caller.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only school admins can add staff.");
  }

  const { email, password, name, role, classId } = request.data;
  if (!email || !password || !role) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }
  if (!["admin", "teacher"].includes(role)) {
    throw new HttpsError("invalid-argument", "Invalid role.");
  }

  const schoolId = caller.token.schoolId;

  const userRecord = await admin.auth().createUser({ email, password, displayName: name });
  await admin.auth().setCustomUserClaims(userRecord.uid, { role, schoolId });

  await admin.firestore()
    .collection("schools").doc(schoolId)
    .collection("staff").doc(userRecord.uid)
    .set({
      name, email, role,
      classId: classId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  logger.info(`Created staff ${userRecord.uid} for school ${schoolId}`);
  return { uid: userRecord.uid };
});

exports.generateChildInviteCode = onCall(async (request) => {
  const caller = request.auth;
  if (!caller || caller.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only school admins can generate invite codes.");
  }

  const { childId } = request.data;
  if (!childId) throw new HttpsError("invalid-argument", "childId is required.");

  const schoolId = caller.token.schoolId;
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();

  await admin.firestore()
    .collection("schools").doc(schoolId)
    .collection("inviteCodes").doc(code)
    .set({
       code,
        childId,
        used: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  return { code };
});

exports.bootstrapSuperAdmin = onCall({ secrets: [bootstrapSecret] }, async (request) => {
  const { email, password, secret } = request.data;
  if (secret !== bootstrapSecret.value()) {
    throw new HttpsError("permission-denied", "Invalid setup key.");
  }

  const flagRef = admin.firestore().collection("system").doc("config");
  const flagSnap = await flagRef.get();
  if (flagSnap.exists && flagSnap.data().superAdminBootstrapped) {
    throw new HttpsError("failed-precondition", "Super admin already exists.");
  }

  const userRecord = await admin.auth().createUser({ email, password });
  await admin.auth().setCustomUserClaims(userRecord.uid, { role: "superadmin" });
  await flagRef.set({ superAdminBootstrapped: true }, { merge: true });

  return { uid: userRecord.uid };
});

exports.createSchool = onCall(async (request) => {
  const caller = request.auth;
  if (!caller || caller.token.role !== "superadmin") {
    throw new HttpsError("permission-denied", "Only the super admin can create schools.");
  }

  const { schoolId, schoolName, adminEmail, adminPassword, adminName } = request.data;
  if (!schoolId || !schoolName || !adminEmail || !adminPassword) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  const schoolRef = admin.firestore().collection("schools").doc(schoolId);
  const existing = await schoolRef.get();
  if (existing.exists) {
    throw new HttpsError("already-exists", "A school with this ID already exists.");
  }

  await schoolRef.set({
    name: schoolName,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const userRecord = await admin.auth().createUser({
    email: adminEmail,
    password: adminPassword,
    displayName: adminName || "",
  });
  await admin.auth().setCustomUserClaims(userRecord.uid, { role: "admin", schoolId });

  await schoolRef.collection("staff").doc(userRecord.uid).set({
    name: adminName || "",
    email: adminEmail,
    role: "admin",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { uid: userRecord.uid, schoolId };
});

exports.redeemInviteCode = onCall(async (request) => {
  const caller = request.auth;
  if (!caller) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const { code } = request.data;
  if (!code) {
    throw new HttpsError("invalid-argument", "code is required.");
  }

  const normalizedCode = code.trim().toUpperCase();

  const matches = await admin.firestore()
    .collectionGroup("inviteCodes")
    .where("code", "==", normalizedCode)
    .limit(1)
    .get();

  if (matches.empty) {
    throw new HttpsError("not-found", "Invalid invite code.");
  }

  const codeDoc = matches.docs[0];
  const codeData = codeDoc.data();

  if (codeData.used) {
    throw new HttpsError("failed-precondition", "This code has already been used.");
  }

  const schoolRef = codeDoc.ref.parent.parent;
  const schoolId = schoolRef.id;
  const childId = codeData.childId;

  await admin.auth().setCustomUserClaims(caller.uid, { role: "parent", schoolId });

  const parentRef = schoolRef.collection("parents").doc(caller.uid);
  const parentSnap = await parentRef.get();
  const existingChildren = parentSnap.exists ? (parentSnap.data().children || []) : [];
  const updatedChildren = existingChildren.includes(childId)
    ? existingChildren
    : [...existingChildren, childId];

  await parentRef.set({
    phone: caller.token.phone_number || null,
    children: updatedChildren,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await codeDoc.ref.update({
    used: true,
    redeemedBy: caller.uid,
    redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { schoolId, childId };
});