const BASE_URL = window.location.origin;

// Show login success message if redirected back
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("login") === "success") {
    const pageId = params.get("pageId");
    alert(`✅ Login successful! Connected to Page ID: ${pageId}`);
    // Clean URL
    window.history.replaceState({}, document.title, "/");
  }
});

// ---------------- LOGIN ----------------
function login() {
  window.location.href = `${BASE_URL}/api/auth/login`;
}

// ---------------- FACEBOOK ----------------

async function postFBText() {
  const message = document.getElementById("fbText").value;
  if (!message) { alert("Please enter a message"); return; }

  try {
    const res = await fetch(`${BASE_URL}/api/post/facebook/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const text = await res.text();
    alert(res.ok ? "✅ Text posted!" : `❌ Error: ${text}`);
  } catch (e) {
    alert("❌ Network error: " + e.message);
  }
}

async function postFBImage() {
  const input = document.getElementById("fbImage");
  if (!input.files.length) { alert("❌ Please select an image first"); return; }

  const form = new FormData();
  form.append("image", input.files[0]);
  form.append("caption", document.getElementById("fbImageCaption").value);

  try {
    const res = await fetch(`${BASE_URL}/api/post/facebook/image`, { method: "POST", body: form });
    const text = await res.text();
    alert(res.ok ? "✅ Image posted!" : `❌ Error: ${text}`);
  } catch (e) {
    alert("❌ Network error: " + e.message);
  }
}

async function postFBVideo() {
  const input = document.getElementById("fbVideo");
  if (!input.files.length) { alert("❌ Please select a video first"); return; }

  const form = new FormData();
  form.append("video", input.files[0]);
  form.append("caption", document.getElementById("fbVideoCaption").value);

  try {
    const res = await fetch(`${BASE_URL}/api/post/facebook/video`, { method: "POST", body: form });
    const text = await res.text();
    alert(res.ok ? "✅ Video posted!" : `❌ Error: ${text}`);
  } catch (e) {
    alert("❌ Network error: " + e.message);
  }
}

// ---------------- INSTAGRAM ----------------

async function postIGImage() {
  const input = document.getElementById("igImage");
  if (!input.files.length) { alert("❌ Please select an image first"); return; }

  const form = new FormData();
  form.append("image", input.files[0]);
  form.append("caption", document.getElementById("igCaption").value);

  try {
    const res = await fetch(`${BASE_URL}/api/post/instagram/image`, { method: "POST", body: form });
    const text = await res.text();
    alert(res.ok ? "✅ IG Image posted!" : `❌ Error: ${text}`);
  } catch (e) {
    alert("❌ Network error: " + e.message);
  }
}

async function postIGVideo() {
  const input = document.getElementById("igVideo");
  if (!input.files.length) { alert("❌ Please select a video first"); return; }

  const form = new FormData();
  form.append("video", input.files[0]);
  form.append("caption", document.getElementById("igVideoCaption").value);

  try {
    const res = await fetch(`${BASE_URL}/api/post/instagram/video`, { method: "POST", body: form });
    const text = await res.text();
    alert(res.ok ? "✅ IG Video posted!" : `❌ Error: ${text}`);
  } catch (e) {
    alert("❌ Network error: " + e.message);
  }
}
