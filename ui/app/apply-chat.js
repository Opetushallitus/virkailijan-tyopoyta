var domainToEnableChatOn = 'virkailija.testiopintopolku.fi';

function enableChat() {
  var script = document.createElement('script');
  script.setAttribute("id", "oc-start-up");
  script.setAttribute("data-oc-service", "0e8747a9-e9c5-4988-bdfb-f52371da5eea-180-88756EB48B5E580FE8993DCDF914B33E8F2DA18D");
  script.setAttribute("data-main", "https://occhat.elisa.fi/chatserver//Scripts/oc-chat");
  script.src = 'https://occhat.elisa.fi/chatserver//Scripts/require.js';
  script.setAttribute("data-oc-language", "fi_FI");
  document.head.appendChild(script);
}

if (document.domain == domainToEnableChatOn) {
  console.log('Enabling chat')
  enableChat();
} else {
  console.log('Chat not enabled on domain ' + document.domain)
}
