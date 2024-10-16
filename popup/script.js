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

document.getElementById("actionScreenTime")?.addEventListener("click", () => {
  window.location.href = 'screen-time-admin.html';
})

document.getElementById("actionFilter")?.addEventListener("click", () => {
  window.location.href = 'filter-admin.html';
})

document.getElementById("actionSearch")?.addEventListener("click", () => {
  alert("search");
})

document.getElementById("actionReport")?.addEventListener("click", () => {
  window.location.href = 'reportUser.html';
})

document.getElementById("button-report")?.addEventListener("click", () => {
  const inputField = document.getElementById("report-user-input");
  const reportUserAdd = document.getElementById("report-user-add");

  if (inputField.value.trim() === "") {
    inputField.style.border = "2px solid red";
  } else {
    const newUser = inputField.value.trim();

    let reportedUsers = JSON.parse(localStorage.getItem("reportedUsers")) || [];

    reportedUsers.push(newUser);

    localStorage.setItem("reportedUsers", JSON.stringify(reportedUsers));

    inputField.style.border = "";
    inputField.value = "";

    reportUserAdd.style.visibility = "visible";
        reportUserAdd.style.opacity = "1";

    setTimeout(() => {
      reportUserAdd.style.opacity = "0"; 
      setTimeout(() => {
        reportUserAdd.style.visibility = "hidden"; 
      }, 500); 
    }, 5000);
  }
})

document.getElementById("return-button")?.addEventListener("click", () => {
  history.back();
})

document.getElementById("settings")?.addEventListener("click", () => {
  window.location.href = 'settings.html';
})

document.getElementById("return")?.addEventListener("click", () => {
  history.back();
})

const clearMode = document.getElementById("toggle-clear");
const darkMode = document.getElementById("toggle-dark");
document.getElementById("toggle-clear")?.addEventListener("click", () => {
  clearMode.hidden = true;
  darkMode.hidden = false;
})
document.getElementById("toggle-dark")?.addEventListener("click", () => {
  clearMode.hidden = false;
  darkMode.hidden = true;
})

function showScreenTimeContent() {
  let screenTimeContent = document.getElementById("screen-time-content");
  screenTimeContent.innerHTML = "";
  chrome.storage.local.get(["screenTimeLimit"], (result) => {
    const list = result.screenTimeLimit ? Array(...result.screenTimeLimit) : [];
    list.forEach((webapp) => {
      const mainDiv = document.createElement("div");
      mainDiv.classList.add("row", "space-between");
      screenTimeContent.appendChild(mainDiv);

      const titleDiv = document.createElement("div");
      titleDiv.classList.add("d-flex");

      const valueSpan = document.createElement("span");
      const hours = Math.floor(webapp.timeLimit / 60);
      const minutes = webapp.timeLimit % 60;
      valueSpan.textContent = `${hours ? `${hours}h` : ''}${minutes ? `${minutes}min` : ''}`;

      mainDiv.append(titleDiv, valueSpan);

      const img = document.createElement("img");
      img.classList.add("favicon");
      img.src = `${webapp.url}/favicon.ico`;
      img.alt = "website icon";

      const titleSpan = document.createElement("span");
      titleSpan.textContent = webapp.name;

      titleDiv.append(img, titleSpan);
    })

    Array.from(document.getElementsByClassName("favicon")).forEach((element) => {
      element.addEventListener("error", () => {
        element.src = "images/website.svg";
      })
    })
  });
}

const screenTimeContent = document.getElementById("screen-time-content");
if (screenTimeContent) {
  showScreenTimeContent();
}

document.getElementById("screenTimeForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  chrome.storage.local.get(["screenTimeLimit"], (result) => {
    const nameElement = document.getElementById('name');
    const urlElement = document.getElementById('url');
    const timeLimitElement = document.getElementById('timeLimit');
    const data = result.screenTimeLimit ? Array(...result.screenTimeLimit) : [];
    data.push({ name: nameElement.value, url: urlElement.value, timeLimit: timeLimitElement.value });
    chrome.storage.local.set({screenTimeLimit: data}, function() {
      nameElement.value = urlElement.value = timeLimitElement.value = '';
      showScreenTimeContent();
    });
  });
})

function showFilterContent() {
  let filterContent = document.getElementById("filter-content");
  filterContent.innerHTML = "";
  chrome.storage.local.get(["filter"], (result) => {
    const list = result.filter ? Array(...result.filter) : [];
    list.forEach((webapp) => {
      const mainDiv = document.createElement("div");
      mainDiv.classList.add("row", "space-between");
      filterContent.appendChild(mainDiv);

      const titleDiv = document.createElement("div");
      titleDiv.classList.add("d-flex");

      const valueSpan = document.createElement("span");
      valueSpan.textContent = webapp.url;

      mainDiv.append(titleDiv, valueSpan);

      const img = document.createElement("img");
      img.classList.add("favicon");
      img.src = `${webapp.url}/favicon.ico`;
      img.alt = "website icon";

      const titleSpan = document.createElement("span");
      titleSpan.textContent = webapp.name;

      titleDiv.append(img, titleSpan);
    })

    Array.from(document.getElementsByClassName("favicon")).forEach((element) => {
      element.addEventListener("error", () => {
        element.src = "images/website.svg";
      })
    })
  });
}

const filterContent = document.getElementById("filter-content");
if (filterContent) {
  showFilterContent();
}

document.getElementById("filterForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  chrome.storage.local.get(["filter"], (result) => {
    const nameElement = document.getElementById('name');
    const urlElement = document.getElementById('url');
    const data = result.filter ? Array(...result.filter) : [];
    data.push({ name: nameElement.value, url: urlElement.value });
    chrome.storage.local.set({filter: data}, function() {
      nameElement.value = urlElement.value = '';
      showFilterContent();
    });
  });
})
