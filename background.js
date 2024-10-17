const regex = /(https?:\/\/w{3}\.)?(https?:\/\/)?([^\/\?]+)/;

function updateBlockingRules(urls) {
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const ruleIds = existingRules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds
    }, () => {
      const rules = urls.map((url, index) => {
        const urlFilter = url.match(regex)[3];
        return {
          "id": index + 1,
          "priority": 1,
          "action": { "type": "block" },
          "condition": {
            "urlFilter": `||${urlFilter}*`,
            "resourceTypes": ["main_frame"]
          }
        };
      });

      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      }, () => {});
    });
  });
}

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.filter) {
    chrome.storage.local.get(["protection"], (result) => {
      if (result.protection || false === true) {
        updateBlockingRules(changes.filter.newValue?.map((e) => e.url) || []);
      }
    });
  }

  if (changes.protection?.newValue === false) {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldRuleIds });
  }

  if (changes.protection?.newValue === true) {
    chrome.storage.local.get(["protection", "filter"], (result) => {
      if (result.protection || false === true) {
        updateBlockingRules(result.filter?.map((e) => e.url) || []);
      }
    });
  }
});