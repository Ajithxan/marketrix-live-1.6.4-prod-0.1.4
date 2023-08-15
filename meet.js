const meetVersion = "1.5.8"
const CDNlink = `https://cdn.jsdelivr.net/gh/Ajithxan/marketrix-live-${meetVersion}/` //'http://localhost/creativehub/marketrix-live-1.3.4/'
console.log(CDNlink)
const startingTime = new Date().getTime()
const socketClientScript = document.createElement("script")
const watchScript = document.createElement("script")
const envScript = document.createElement("script")
const storeScript = document.createElement("script")
const socketScript = document.createElement("script")
const mainScript = document.createElement("script")
const endPointScript = document.createElement("script")
const videoSDKScript = document.createElement("script")
const variablesScript = document.createElement("script")
const mouseScript = document.createElement("script")
const meetingScript = document.createElement("script")
const fontAwesomeLink = document.createElement("link")

// stylesheet links
fontAwesomeLink.setAttribute("rel", "stylesheet");
fontAwesomeLink.setAttribute(
  "href",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
);
// scripts
envScript.setAttribute(
  "async",
  "false"
);
envScript.setAttribute(
  "defer",
  "false"
);
envScript.setAttribute("src", `${CDNlink}constants/env.js`);
document.body.append(envScript);

storeScript.setAttribute(
  "async",
  "false"
);
storeScript.setAttribute(
  "defer",
  "false"
);
storeScript.setAttribute("src", `${CDNlink}store/store.js`);
document.body.append(storeScript);

socketScript.setAttribute(
  "async",
  "false"
);
socketScript.setAttribute(
  "defer",
  "false"
);
socketScript.setAttribute("src", `${CDNlink}services/socket.js`);
document.body.append(socketScript);

variablesScript.setAttribute(
  "async",
  "false"
);
variablesScript.setAttribute(
  "defer",
  "false"
);
variablesScript.setAttribute("src", `${CDNlink}services/variables.js`);
document.body.append(variablesScript);

videoSDKScript.setAttribute(
  "async",
  "false"
);
videoSDKScript.setAttribute(
  "defer",
  "false"
);
videoSDKScript.setAttribute(
  "src",
  "https://sdk.videosdk.live/js-sdk/0.0.67/videosdk.js"
);
document.body.append(videoSDKScript);

socketClientScript.setAttribute("crossorigin", "anonymous");
socketClientScript.setAttribute(
  "async",
  "false"
);
socketClientScript.setAttribute(
  "defer",
  "false"
);
socketClientScript.setAttribute(
  "src",
  "https://cdn.socket.io/4.6.0/socket.io.min.js"
);
document.body.append(socketClientScript);

meetingScript.setAttribute(
  "async",
  "false"
);
meetingScript.setAttribute(
  "defer",
  "false"
);
meetingScript.setAttribute("src", `${CDNlink}services/meeting.js`);
document.body.append(meetingScript)

mouseScript.setAttribute(
  "async",
  "false"
);
mouseScript.setAttribute(
  "defer",
  "false"
);
mouseScript.setAttribute("src", `${CDNlink}services/mouse.js`);
document.body.append(mouseScript);

watchScript.setAttribute(
  "async",
  "false"
);
watchScript.setAttribute(
  "defer",
  "false"
);
watchScript.setAttribute("src", `${CDNlink}services/watch.js`);
document.body.append(watchScript);

mainScript.setAttribute(
  "async",
  "false"
);
mainScript.setAttribute(
  "defer",
  "false"
);
mainScript.setAttribute("src", `${CDNlink}services/main.js`);
document.body.append(mainScript);

// header link
document.head.prepend(fontAwesomeLink);

const appId = document.currentScript.getAttribute("marketrix-id");
const apiKey = document.currentScript.getAttribute("marketrix-key");
let geoLocation = {
  accuracy: 1275.102691209434,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  latitude: 6.8681728,
  longitude: 79.8687232,
  speed: null
}
let ipAddress;