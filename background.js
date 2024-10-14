chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "scorePage",
        title: "Afficher le score de cette page",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "scorePage") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: calculerScore
        });
    }
});

function calculerScore() {
    const score = 42069;
    alert("Le score de cette page est: " + score.toFixed(2));
}
