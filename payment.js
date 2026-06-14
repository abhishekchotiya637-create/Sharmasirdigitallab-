// ============================================================
// Sharma Sir's Digital Lab — Payment Module (Razorpay)
// ============================================================
// ⚠️ STEP 2: Paste your Razorpay KEY ID below (the "rzp_test_..."
//    or "rzp_live_..." string — NOT the secret)
// ⚠️ STEP 3: After deploying the Cloud Function (see /functions),
//    paste its URL into CLOUD_FUNCTION_URL below.
// ============================================================

const RAZORPAY_KEY_ID = "rzp_live_T1BZHB6I7wPUmw"; // ⚠️ LIVE KEY — real payments will be charged
const CREATE_ORDER_URL = "PASTE_YOUR_CREATE_ORDER_FUNCTION_URL"; // e.g. https://us-central1-xxx.cloudfunctions.net/createOrder
const VERIFY_PAYMENT_URL = "PASTE_YOUR_VERIFY_PAYMENT_FUNCTION_URL"; // e.g. https://us-central1-xxx.cloudfunctions.net/verifyPayment

import { auth, db } from './auth.js';
import { doc, updateDoc, arrayUnion, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Open Razorpay checkout for a single item.
 * @param {Object} item - { id, title, price } price in RUPEES (e.g. 49)
 * @param {Function} onSuccess - called after payment is verified & unlocked
 */
export async function buyItem(item, onSuccess) {
  const user = auth.currentUser;
  if (!user) {
    const redirect = encodeURIComponent(window.location.href);
    window.location.href = `login.html?redirect=${redirect}`;
    return;
  }

  let order = null;
  const useOrders = CREATE_ORDER_URL && !CREATE_ORDER_URL.includes("PASTE_");

  if (useOrders) {
    const res = await fetch(CREATE_ORDER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: item.price * 100, itemId: item.id })
    });
    const data = await res.json();
    if (!data.success) {
      alert("⚠️ Order बनाने में समस्या हुई, फिर से कोशिश करें।");
      return;
    }
    order = data.order;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: item.price * 100, // paise
    currency: "INR",
    name: "Sharma Sir's Digital Lab",
    description: item.title,
    image: "https://abhishekchotiya637-create.github.io/Sharmasirdigitallab-/logo.jpg",
    order_id: order ? order.id : undefined,
    prefill: {
      name: user.displayName || "",
      email: user.email || "",
      contact: user.phoneNumber || ""
    },
    notes: {
      itemId: item.id,
      uid: user.uid
    },
    theme: { color: "#E8610A" },
    handler: async function (response) {
      // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      await verifyAndUnlock(item.id, user.uid, response);
      if (onSuccess) onSuccess();
    },
    modal: {
      ondismiss: function () {
        console.log("Payment popup closed by user");
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

/**
 * Sends payment details to the Cloud Function for signature verification.
 * On success, the Cloud Function writes to Firestore: users/{uid}.purchases
 * As a client-side fallback (if Cloud Function isn't deployed yet),
 * this also optimistically updates Firestore directly — REMOVE the
 * fallback once your Cloud Function is live, for security.
 */
async function verifyAndUnlock(itemId, uid, razorpayResponse) {
  try {
    if (VERIFY_PAYMENT_URL && !VERIFY_PAYMENT_URL.includes("PASTE_")) {
      const res = await fetch(VERIFY_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...razorpayResponse, itemId, uid })
      });
      const data = await res.json();
      if (!data.success) throw new Error("Verification failed");
    } else {
      // ⚠️ TEMPORARY fallback (no signature check) — only for local testing
      await updateDoc(doc(db, "users", uid), {
        purchases: arrayUnion(itemId)
      });
    }
    alert("✅ Payment सफल! आपका content अब unlock हो गया है।");
    location.reload();
  } catch (err) {
    console.error(err);
    alert("⚠️ Payment हो गया लेकिन verify नहीं हो पाया। कृपया Telegram पर contact करें — payment ID: " + razorpayResponse.razorpay_payment_id);
  }
}

/** Check if current logged-in user has purchased a given item */
export async function checkAccess(itemId) {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return false;
  const purchases = snap.data().purchases || [];
  return purchases.includes(itemId);
}

