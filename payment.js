// ============================================================
// Sharma Sir's Digital Lab — Razorpay Payment Module
// Key ID: rzp_live_T1BZHB6I7wPUmw (Live Mode)
// ⚠️ Cloud Function URLs — खाली हैं, deploy के बाद भरेंगे
// ============================================================

const RAZORPAY_KEY_ID = "rzp_live_T1BZHB6I7wPUmw";
const CREATE_ORDER_URL = ""; // Cloud Function deploy होने के बाद भरें
const VERIFY_PAYMENT_URL = ""; // Cloud Function deploy होने के बाद भरें

import { auth, db } from './auth.js';
import {
  doc, updateDoc, arrayUnion, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function buyItem(item, onSuccess) {
  const user = auth.currentUser;
  if (!user) {
    const redirect = encodeURIComponent(window.location.href);
    window.location.href = `./login.html?redirect=${redirect}`;
    return;
  }

  let orderId = undefined;

  // अगर Cloud Function तैयार है तो पहले Order बनाएं
  if (CREATE_ORDER_URL) {
    try {
      const res = await fetch(CREATE_ORDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: item.price * 100, itemId: item.id })
      });
      const data = await res.json();
      if (data.success) orderId = data.order.id;
    } catch (e) {
      console.warn("Order creation failed, proceeding without order_id", e);
    }
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: item.price * 100,
    currency: "INR",
    name: "Sharma Sir's Digital Lab",
    description: item.title,
    image: "https://abhishekchotiya637-create.github.io/Sharmasirdigitallab-/logo.jpg",
    order_id: orderId,
    prefill: {
      name: user.displayName || "",
      email: user.email || "",
      contact: user.phoneNumber || ""
    },
    notes: { itemId: item.id, uid: user.uid },
    theme: { color: "#E8610A" },
    handler: async function (response) {
      await verifyAndUnlock(item.id, user.uid, response);
      if (onSuccess) onSuccess();
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}

async function verifyAndUnlock(itemId, uid, razorpayResponse) {
  try {
    if (VERIFY_PAYMENT_URL) {
      const res = await fetch(VERIFY_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...razorpayResponse, itemId, uid })
      });
      const data = await res.json();
      if (!data.success) throw new Error("Verification failed");
    } else {
      // ⚠️ Temporary: Cloud Function के बिना direct Firestore में unlock
      // जब Cloud Function तैयार हो, यह हटा देंगे
      await updateDoc(doc(db, "users", uid), {
        purchases: arrayUnion(itemId)
      });
    }
    alert("✅ Payment सफल! Content unlock हो गया।");
    location.reload();
  } catch (err) {
    console.error(err);
    alert("⚠️ Payment हुआ लेकिन verify नहीं हो पाया। Telegram पर contact करें। Payment ID: " + razorpayResponse.razorpay_payment_id);
  }
}

export async function checkAccess(itemId) {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return false;
  return (snap.data().purchases || []).includes(itemId);
}
