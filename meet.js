const meetVersion = "1.6.4-prod-0.1.4"
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

// env scripts #1
envScript.setAttribute(
  "async",
  "false"
);
envScript.setAttribute(
  "defer",
  "true"
);
envScript.setAttribute("src", `${CDNlink}constants/env.js`);
document.body.append(envScript);
envScript.addEventListener("load", () => {
  // store script #2
  storeScript.setAttribute(
    "async",
    "false"
  );
  storeScript.setAttribute(
    "defer",
    "true"
  );
  storeScript.setAttribute("src", `${CDNlink}store/store.js`);
  document.body.append(storeScript);
  storeScript.addEventListener("load", () => {
    // socket script #3
    socketScript.setAttribute(
      "async",
      "false"
    );
    socketScript.setAttribute(
      "defer",
      "true"
    );
    socketScript.setAttribute("src", `${CDNlink}services/socket.js`);
    document.body.append(socketScript);
    socketScript.addEventListener("load", () => {
      // variables script #4
      variablesScript.setAttribute(
        "async",
        "false"
      );
      variablesScript.setAttribute(
        "defer",
        "true"
      );
      variablesScript.setAttribute("src", `${CDNlink}services/variables.js`);
      document.body.append(variablesScript);
      variablesScript.addEventListener("load", () => {
        // video script #5
        videoSDKScript.setAttribute(
          "async",
          "false"
        );
        videoSDKScript.setAttribute(
          "defer",
          "true"
        );
        videoSDKScript.setAttribute(
          "src",
          "https://sdk.videosdk.live/js-sdk/0.0.67/videosdk.js"
        );
        document.body.append(videoSDKScript);
        videoSDKScript.addEventListener("load", () => {
          // socket client script #6
          socketClientScript.setAttribute("crossorigin", "anonymous");
          socketClientScript.setAttribute(
            "async",
            "false"
          );
          socketClientScript.setAttribute(
            "defer",
            "true"
          );
          socketClientScript.setAttribute(
            "src",
            "https://cdn.socket.io/4.6.0/socket.io.min.js"
          );
          document.body.append(socketClientScript);
          socketClientScript.addEventListener("load", () => {
            // meeting script #7
            meetingScript.setAttribute(
              "async",
              "false"
            );
            meetingScript.setAttribute(
              "defer",
              "true"
            );
            meetingScript.setAttribute("src", `${CDNlink}services/meeting.js`);
            document.body.append(meetingScript)
            meetingScript.addEventListener("load", () => {
              // mouse script #8
              mouseScript.setAttribute(
                "async",
                "false"
              );
              mouseScript.setAttribute(
                "defer",
                "true"
              );
              mouseScript.setAttribute("src", `${CDNlink}services/mouse.js`);
              document.body.append(mouseScript);
              mouseScript.addEventListener("load", () => {
                // watch script #9
                watchScript.setAttribute(
                  "async",
                  "false"
                );
                watchScript.setAttribute(
                  "defer",
                  "true"
                );
                watchScript.setAttribute("src", `${CDNlink}services/watch.js`);
                document.body.append(watchScript);
                watchScript.addEventListener("load", () => {
                  // main script #10
                  mainScript.setAttribute(
                    "async",
                    "false"
                  );
                  mainScript.setAttribute(
                    "defer",
                    "true"
                  );
                  mainScript.setAttribute("src", `${CDNlink}services/main.js`);
                  document.body.append(mainScript);
                  mainScript.addEventListener("load", () => {
                    console.log("all scripts loaded...")
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
// header link
document.head.prepend(fontAwesomeLink);

const appId = document.currentScript.getAttribute("marketrix-id");
const apiKey = document.currentScript.getAttribute("marketrix-key");
console.log("app ID", appId)
console.log("api Key", apiKey)
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