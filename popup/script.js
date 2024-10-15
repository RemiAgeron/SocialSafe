async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function storePassword(password) {
  const hashedPassword = await hashPassword(password);
  chrome.storage.local.set({ adminPassword: hashedPassword }, function () {
  });
}

document.getElementById("navActions")?.addEventListener("click", () => {
  window.location.href = 'actions.html';
})

document.getElementById("navStats")?.addEventListener("click", () => {
  window.location.href = 'stats.html';
})

document.getElementById("actionAdmin")?.addEventListener("click", () => {
  const admin = document.getElementById("admin");
  if (admin !== undefined) {
    admin.hidden = !admin.hidden;
  }
})

document.getElementById("actionSearch")?.addEventListener("click", () => {
  alert("search");
})

document.getElementById("actionReport")?.addEventListener("click", () => {
  alert("report");
})
