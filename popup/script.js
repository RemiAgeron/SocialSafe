async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function storePassword(hashedPassword) {
  chrome.storage.local.set({ adminPassword: hashedPassword }, Function);
}

async function verifyPassword(password) {
  const hashedPassword = await hashPassword(password);
  return new Promise((resolve) => {
    chrome.storage.local.get(['adminPassword'], (result) => {
      if (result.adminPassword) {
        resolve(result.adminPassword === hashedPassword);
      } else {
        storePassword(hashedPassword);
        resolve(true);
      }
    });
  });
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  const isPasswordCorrect = await verifyPassword(password);
  if (isPasswordCorrect) {
    window.location.href = 'actions-admin.html';
  } else {
    document.getElementById('errorMessage').hidden = false;
  }
});

document.getElementById("navActions")?.addEventListener("click", () => {
  window.location.href = 'actions.html';
})

document.getElementById("navStats")?.addEventListener("click", () => {
  window.location.href = 'stats.html';
})

document.getElementById("navActionsAdmin")?.addEventListener("click", () => {
  window.location.href = 'actions-admin.html';
})

document.getElementById("navStatsAdmin")?.addEventListener("click", () => {
  window.location.href = 'stats-admin.html';
})

document.getElementById("actionAdmin")?.addEventListener("click", async () => {
  chrome.storage.local.get(["adminPassword"], (result) => {
    if (!result.adminPassword) document.getElementById('creationMessage').hidden = false;
  });
  const adminLogin = document.getElementById("adminLogin");
  if (adminLogin !== undefined) adminLogin.hidden = !adminLogin.hidden;
})

function showProtection() {
  const statusActive = document.getElementById("statusActive");
  const statusUnactive = document.getElementById("statusUnactive");
  chrome.storage.local.get(["protectionActive"], (result) => {
    if (result.protectionActive || false === true) {
      statusActive.hidden = false;
      statusUnactive.hidden = true;
    } else {
      statusActive.hidden = true;
      statusUnactive.hidden = false;
    }
  });
}

if (document.getElementById("protection")) showProtection();

document.getElementById("actionActive")?.addEventListener("click", () => {
  chrome.storage.local.set({ protectionActive: true }, () => showProtection());
})

document.getElementById("actionUnactive")?.addEventListener("click", () => {
  chrome.storage.local.set({ protectionActive: false }, () => showProtection());
})

document.getElementById("actionQuit")?.addEventListener("click", () => {
  window.location.href = 'actions.html';
})

document.getElementById("actionSearch")?.addEventListener("click", () => {
  alert("search");
})

document.getElementById("actionReport")?.addEventListener("click", () => {
  alert("report");
})
