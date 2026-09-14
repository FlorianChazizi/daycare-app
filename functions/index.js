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


exports.deleteStaffAccount = onCall(async (request) => {
  const caller = request.auth;
  if (!caller || caller.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only school admins can remove staff.");
  }

  const { uid } = request.data;
  if (!uid) throw new HttpsError("invalid-argument", "uid is required.");

  if (uid === caller.uid) {
    throw new HttpsError("failed-precondition", "You can't remove your own account.");
  }

  const schoolId = caller.token.schoolId;
  const staffRef = admin.firestore()
    .collection("schools").doc(schoolId)
    .collection("staff").doc(uid);

  const staffSnap = await staffRef.get();
  if (!staffSnap.exists) {
    throw new HttpsError("not-found", "Staff member not found in your school.");
  }

  await admin.auth().deleteUser(uid);
  await staffRef.delete();

  logger.info(`Deleted staff ${uid} from school ${schoolId}`);
  return { uid };
});


exports.createParentAccount = onCall(async (request) => {
  const caller = request.auth;
  if (!caller || caller.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only school admins can create parent accounts.");
  }

  const { email, childId } = request.data;
  if (!email || !childId) {
    throw new HttpsError("invalid-argument", "email and childId are required.");
  }

  const schoolId = caller.token.schoolId;

  const childRef = admin.firestore()
    .collection("schools").doc(schoolId)
    .collection("children").doc(childId);
  const childSnap = await childRef.get();
  if (!childSnap.exists) {
    throw new HttpsError("not-found", "Child not found in your school.");
  }

  let userRecord = null;
  let isNewAccount = false;
  let temporaryPassword = null;

  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;
  }

  if (userRecord) {
    const existingClaims = userRecord.customClaims || {};
    if (existingClaims.role !== "parent" || existingClaims.schoolId !== schoolId) {
      throw new HttpsError("already-exists", "This email is already used by a different account.");
    }
  } else {
    temporaryPassword = Math.floor(100000 + Math.random() * 900000).toString();
    userRecord = await admin.auth().createUser({ email, password: temporaryPassword });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "parent", schoolId });
    isNewAccount = true;
  }

  const parentRef = admin.firestore()
    .collection("schools").doc(schoolId)
    .collection("parents").doc(userRecord.uid);
  const parentSnap = await parentRef.get();
  const existingChildren = parentSnap.exists ? (parentSnap.data().children || []) : [];
  const updatedChildren = existingChildren.includes(childId) ? existingChildren : [...existingChildren, childId];

  await parentRef.set(
    {
      email,
      children: updatedChildren,
  mustChangePassword: isNewAccount || !parentSnap.exists ? true : (parentSnap.data().mustChangePassword ?? false),
      ...(isNewAccount ? { createdAt: admin.firestore.FieldValue.serverTimestamp() } : {}),
    },
    { merge: true }
  );

  logger.info(`${isNewAccount ? "Created" : "Linked"} parent ${userRecord.uid} to child ${childId} in school ${schoolId}`);
  return { uid: userRecord.uid, isNewAccount, temporaryPassword };
});