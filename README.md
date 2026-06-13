# Login + Premium Payment System — README

यह सिस्टम आपकी वेबसाइट में **Login (Email/Google/Mobile OTP)** और **Pay-per-item Premium Content** जोड़ता है — सब GitHub Pages पर बिना किसी पुराने hosting के चलेगा।

---

## 📁 Files का ढांचा

```
Sharmasirdigitallab-/
├── login.html              ← Login/Signup पेज
├── dashboard.html          ← User का अपना account page
├── premium-content.html    ← Premium Tests/Notes — Buy/Unlock
├── firestore.rules         ← Firebase Console में paste करनी है
├── assets/
│   ├── auth.js             ← Firebase login logic (config यहीं डालें)
│   └── payment.js          ← Razorpay payment logic (keys यहीं डालें)
└── functions/
    └── index.js            ← Cloud Functions (payment verify) — अलग से deploy होगा
```

सभी फाइलें आपके GitHub repo के **root** में उसी जगह डालें जैसे index.html, test-series.html हैं। `assets/` एक नया folder बनाकर उसमें auth.js और payment.js डालें।

---

## ✅ अभी तक क्या तैयार है

1. **login.html** — Email/Password, Google, Mobile OTP तीनों एक साथ
2. **dashboard.html** — Login के बाद अपना profile + purchases दिखता है
3. **premium-content.html** — Demo catalog (2 tests + 2 notes) — pay-per-item
4. **assets/auth.js** — सारा Firebase logic, सिर्फ config डालना है
5. **assets/payment.js** — Razorpay checkout + order creation + verification
6. **functions/index.js** — Cloud Functions: `createOrder` + `verifyPayment`
7. **firestore.rules** — Security rules (कोई client purchases को fake नहीं कर सकता)

---

## 🔧 आपको क्या करना है (Step-by-Step)

### Part A — Firebase (SETUP_GUIDE.md देखें)
1. Firebase project बनाएं → Authentication में Email, Google, Phone enable करें
2. Firestore Database बनाएं (Mumbai region)
3. `firestore.rules` का कोड Firebase Console के Rules टैब में paste करके Publish करें
4. Project Settings से `firebaseConfig` कॉपी करें

### Part B — `assets/auth.js` में Config डालें
फाइल खोलें, ऊपर का यह हिस्सा अपने Firebase config से बदलें:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};
```

### Part C — Razorpay (SETUP_GUIDE.md देखें)
1. Razorpay account बनाएं (Test mode से शुरू करें)
2. API Keys से **Key ID** लें (`rzp_test_...`)

### Part D — Cloud Functions Deploy करें
यह हिस्सा थोड़ा technical है — टर्मिनल/कमांड लाइन चलानी होगी:

```bash
npm install -g firebase-tools
firebase login
firebase init functions     # अपना project चुनें, JavaScript चुनें

cd functions
npm install cors razorpay

firebase functions:config:set razorpay.key_id="rzp_test_XXXX" razorpay.secret="XXXXXXXX"
firebase deploy --only functions
```

Deploy होने के बाद आपको 2 URLs मिलेंगे:
```
https://us-central1-yourproject.cloudfunctions.net/createOrder
https://us-central1-yourproject.cloudfunctions.net/verifyPayment
```

### Part E — `assets/payment.js` में Keys/URLs डालें
```javascript
const RAZORPAY_KEY_ID = "rzp_test_XXXX";
const CREATE_ORDER_URL = "https://us-central1-yourproject.cloudfunctions.net/createOrder";
const VERIFY_PAYMENT_URL = "https://us-central1-yourproject.cloudfunctions.net/verifyPayment";
```

---

## 🧪 Testing Order (सुझाव)

1. पहले सिर्फ **Login system** टेस्ट करें (Firebase config डालकर) — Cloud Functions के बिना भी login.html और dashboard.html काम करेंगे
2. फिर Razorpay **Test Mode** keys डालकर premium-content.html टेस्ट करें — Test card नंबर: `4111 1111 1111 1111`, कोई भी future date, कोई भी CVV
3. सब ठीक चले तो Razorpay की **Live Keys** (KYC के बाद) डालें

---

## 🔗 अपनी मौजूदा Website से जोड़ना

अपने `index.html`, `test-series.html` आदि की navbar में एक नया लिंक जोड़ें:
```html
<a href="login.html">👤 Login</a>
```
या अगर user logged-in है तो "Dashboard" दिखे — यह आसानी से `assets/auth.js` के `watchAuthState` से navbar में भी जोड़ा जा सकता है (अगर चाहें तो बताइए, मैं navbar.js जोड़ दूंगा जो हर पेज पर login status दिखाए)।

`premium-content.html` के अंदर `ITEMS` object में अपने वाकई के Tests/Notes के नाम, price, और फाइल लिंक डालें — डेमो के 4 items सिर्फ उदाहरण हैं।

---

## ⚠️ ज़रूरी बातें

- **Razorpay Key Secret** कभी भी किसी HTML/JS फाइल में मत डालें — सिर्फ Cloud Function के environment config में।
- शुरुआत में **Test Mode** में सब चेक करें, फिर KYC होने पर Live keys में बदलें।
- अगर Cloud Functions deploy करना मुश्किल लगे, तो मुझे बताइए — मैं हर स्टेप में स्क्रीन-शॉट जैसे निर्देश और टर्मिनल कमांड्स के साथ मदद कर सकता हूँ।

---

## 📌 अगला कदम क्या है?

जब आप Part A (Firebase) और Part C (Razorpay Key ID) पूरा कर लें, मुझे भेजें:
1. `firebaseConfig` (पूरा ऑब्जेक्ट)
2. Razorpay Key ID

मैं `assets/auth.js` और `assets/payment.js` में ये values भर दूंगा, और अगर चाहें तो Cloud Function deploy करने में भी पूरी मदद करूंगा।
