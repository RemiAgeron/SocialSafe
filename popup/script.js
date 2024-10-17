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
  chrome.storage.local.get(["protection"], (result) => {
    if (result.protection || false === true) {
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
  chrome.storage.local.set({ protection: true }, () => showProtection());
})

document.getElementById("actionUnactive")?.addEventListener("click", () => {
  chrome.storage.local.set({ protection: false }, () => showProtection());
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
  window.location.href = 'searchUser.html';
})

document.getElementById("actionReport")?.addEventListener("click", () => {
  window.location.href = 'reportUser.html';
})

document.getElementById("button-report")?.addEventListener("click", () => {
  const inputField = document.getElementById("report-user-input");


  if (inputField.value.trim() === "") {
    inputField.style.border = "2px solid red";
  } else {
    const newUser = inputField.value.trim();

    addReportedUser(newUser);

    inputField.style.border = "";
    inputField.value = "";
  }
})

function addReportedUser(user) {
  const reportUserAdd = document.getElementById("report-user-add");
  // Récupérer la liste des utilisateurs signalés dans le localStorage
  let reportedUsers = JSON.parse(localStorage.getItem("reportedUsers")) || [];

  // Ajouter l'utilisateur à la liste des signalés
  reportedUsers.push(user);

  // Mettre à jour le localStorage
  localStorage.setItem("reportedUsers", JSON.stringify(reportedUsers));

  reportUserAdd.style.padding = "10px";
  reportUserAdd.style.opacity = "1";
  reportUserAdd.style.height = "auto";

  setTimeout(() => {
    reportUserAdd.style.height = "0";
    reportUserAdd.style.opacity = "0";
    setTimeout(() => {
      reportUserAdd.style.padding = "0";
    }, 500);
  }, 3000);
}

document.getElementById("search-user-report")?.addEventListener("input", () => {
  let typingTimer;
  clearTimeout(typingTimer); // Réinitialise le timer à chaque frappe
  typingTimer = setTimeout(searchUsers, 500); // Lance la recherche après 1 seconde d'inactivité
});

function searchUsers() {
  const searchTerm = document.getElementById("search-user-report")?.value.toLowerCase();
  const searchResultsContainer = document.getElementById("search-results");

  // Vider le conteneur des résultats avant d'afficher les nouveaux
  searchResultsContainer.innerHTML = '';
  searchResultsContainer.style.display = "none";

  if (searchTerm != '') {
    // Vérifier si le localStorage contient des utilisateurs signalés
    const reportedUsers = JSON.parse(localStorage.getItem("reportedUsers")) || [];

    // Filtrer les utilisateurs contenant les caractères du terme de recherche
    const filteredUsers = reportedUsers.filter(user => user.toLowerCase().includes(searchTerm)).slice(0, 10);

    // Compter le nombre d'occurrences pour chaque utilisateur filtré
    const userCounts = filteredUsers.reduce((acc, user) => {
      acc[user] = reportedUsers.filter(u => u === user).length; // Compter le nombre de fois que l'utilisateur apparaît
      return acc;
    }, {});

    // Récupérer les utilisateurs uniques
    const uniqueUsers = Object.keys(userCounts);

    // Afficher les résultats si des utilisateurs correspondent
    if (uniqueUsers.length === 0) {
      searchResultsContainer.innerHTML = '<p>Aucun résultat trouvé.</p>';
    } else {
      uniqueUsers.forEach(user => {
        // Créer une div contenant une puce, un bouton et le nombre de signalements
        const userElement = document.createElement("div");
        userElement.className = "result-item"; // Ajouter la classe CSS

        // Créer la puce avec le nom d'utilisateur
        const userLabel = document.createElement("span");
        userLabel.textContent = user;
        userLabel.className = "user-label";

        // Créer le bouton "Signaler"
        const reportButton = document.createElement("button");
        reportButton.textContent = "Signaler";
        reportButton.className = "report-button";

        // Créer un élément pour afficher le nombre de signalements
        const reportCount = document.createElement("span");
        reportCount.textContent = userCounts[user];
        reportCount.className = "report-count";

        // Ajouter les éléments à la ligne (div)
        userElement.appendChild(userLabel);
        userElement.appendChild(reportButton);
        userElement.appendChild(reportCount);

        // Ajouter la ligne complète au conteneur des résultats
        searchResultsContainer.appendChild(userElement);
        searchResultsContainer.style.display = "initial";

        // Ajouter l'événement de clic au bouton "Signaler"
        reportButton.addEventListener("click", () => {
          addReportedUser(user);
        });
      });
    }
  }
}

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

const regex = /(https?:\/\/w{3}\.)?(https?:\/\/)?([^\/\?]+)/;

document.getElementById("filterForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  chrome.storage.local.get(["filter"], (result) => {
    const nameElement = document.getElementById('name');
    const urlElement = document.getElementById('url');
    const url = urlElement.value.match(regex)[0];
    const data = result.filter ? Array(...result.filter) : [];
    data.push({ name: nameElement.value, url: url });
    chrome.storage.local.set({filter: data}, function() {
      nameElement.value = urlElement.value = '';
      showFilterContent();
    });
  });
})
