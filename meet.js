const meetVersion = "2.4";
const CDNlink = `https://cdn.jsdelivr.net/gh/Ajithxan/marketrix-live-${meetVersion}/`; //'http://localhost/creativehub/marketrix-live-1.7/'
console.log(CDNlink);
const startingTime = new Date().getTime();
// const jqueryScript = document.createElement('script')
const sweetAlert2Script = document.createElement("script");
const socketClientScript = document.createElement("script");
const watchScript = document.createElement("script");
const envScript = document.createElement("script");
const endPointScript = document.createElement("script");
const videoSDKScript = document.createElement("script");
const fontAwesomeLink = document.createElement("link");

// stylesheet links
fontAwesomeLink.setAttribute("rel", "stylesheet");
fontAwesomeLink.setAttribute(
  "href",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
);
// scripts
sweetAlert2Script.setAttribute(
  "src",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11"
);
socketClientScript.setAttribute(
  "src",
  "https://cdn.socket.io/4.6.0/socket.io.min.js"
);
socketClientScript.setAttribute("crossorigin", "anonymous");
envScript.setAttribute("src", `${CDNlink}constants/env.js`);
videoSDKScript.setAttribute(
  "src",
  "https://sdk.videosdk.live/js-sdk/0.0.67/videosdk.js"
);
watchScript.setAttribute("src", `${CDNlink}libraries/watch.js`);

const socketUrl = "https://socket-v2.marketrix.io/"; //"https://marketrix-soc.creative-hub.co/"
const serverBaseUrl = "https://api-v2.marketrix.io/";
// script tags

document.body.prepend(sweetAlert2Script);
document.body.prepend(socketClientScript);
document.body.prepend(watchScript);
// document.body.prepend(jqueryScript)
document.body.prepend(envScript);

// header link
document.head.prepend(fontAwesomeLink);

const checkReady = (callback) => {
  setTimeout(() => {
    callback();
  }, 500);
};

let socket;
let startInterval;
let decodedObject = {}; // admin information which are getting from the url would be store in the objec
// all information which are related to meeting would be store in this object
const meetingVariables = {
  id: "",
  token: "",
  name: "",
  userRole: "visitor",
  participant: {
    localId: "",
    remoteId: "",
  },
};
let video; //video sdk
const appId = document.currentScript.getAttribute("marketrix-id");
const apiKey = document.currentScript.getAttribute("marketrix-key");
// contact-form.html
let marketrixModalContainer;
let overlay;
// contact-button.html
let marketrixButton;
// coonfiguration.html
let videoContainer;
let configurationCoverDiv;
let gridScreenDiv;
let contorlsDiv;

const getQuery = () => {
  const url = window.location.href;
  const queryString = new URL(url).searchParams.get("marketrix-meet");

  if (queryString != null) {
    const decodedString = decodeURIComponent(queryString);

    // Parse the decoded string as a JavaScript object
    decodedObject = JSON.parse(decodedString);
    console.log("decodedObject", decodedObject);

    if (decodedObject?.userRole === "admin") {
      meetingVariables.id = decodedObject.meetingId;
      meetingVariables.token = decodedObject.token;
      meetingVariables.name = decodedObject.userName;
      meetingVariables.userRole = decodedObject.userRole;
      meetingObj.connect(); // video sdk screen is starting
      socket?.on("redirectUserToVisitor", (visitorLocation) => {
        console.log("redirecting to visitor", visitorLocation);
      });
      // button for the admin
      setTimeout(() => {
        meetingObj.joinMeeting(); // in one sec, admin is able to joining the meeting
      }, 1000);
    }
  }
};

// code snippet initializing
const start = () => {
  const buttonDiv = document.createElement("div");
  const contactFormDiv = document.createElement("div");

  buttonDiv.setAttribute("id", "button-div");
  contactFormDiv.setAttribute("id", "contact-form-div");

  // $("#button-div").css("position", "relative")
  buttonDiv.style.position = "relative";
  document.body.prepend(contactFormDiv);
  document.body.prepend(buttonDiv);

  fetch(`${CDNlink}pages/contact-button.html`)
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      buttonDiv.innerHTML = html;
      marketrixButton = document.getElementById("marketrix-button");
      console.log(marketrixButton);
    });

  fetch(`${CDNlink}pages/contact-form.html`)
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      contactFormDiv.innerHTML = html;
      marketrixModalContainer = document.getElementById(
        "marketrix-modal-container"
      );
      overlay = document.querySelector(".mtx-overlay");
    });

  getQuery();
  // mouse.startMove()
  console.log("app-id", appId);
  console.log("api-key", apiKey);
};

// initializing the library
checkReady(() => {
  document.body.prepend(videoSDKScript);
  start();
  // model related variables come here.
});

const closeModal = () => {
  marketrixButton.classList.remove("mtx-hidden");
  marketrixModalContainer.classList.add("mtx-hidden");
  overlay.classList.add("mtx-hidden");
};

const showModal = () => {
  marketrixButton.classList.add("mtx-hidden");
  marketrixModalContainer.classList.remove("mtx-hidden");
  overlay.classList.remove("mtx-hidden");
};

const connectUserToLive = (meetInfo) => {
  console.log("meetInfo", meetInfo);
  socket = io.connect(socketUrl, { query: { appId } });
  socket.emit("userJoinLive", meetInfo);
  connectedUsers();
};

const connectedUsers = () => {
  socket.on("connectedUsers", (data) => {
    console.log("connectedUsers..........", data);

    const localUserRole = meetingVariables.userRole;
    console.log("local user role", localUserRole);
    const index = data.findIndex(
      (r) => r.userRole !== localUserRole && r.meetingId === meetingVariables.id
    );
    if (index < 0) return;
    const cursor = data[index].cursor;
    console.log(cursor, data[index].userRole, localUserRole);
    const remoteId = meetingVariables.participant.remoteId;
    const meetingId = meetingVariables.id;
    mouse.showCursor = cursor.showCursor;
    if (remoteId && mouse.showCursor) {
      console.log("coming", remoteId);
      const fDiv = document.getElementById(`f-${remoteId}`);
      const cpDiv = document.getElementById(`cp-${remoteId}`);
      console.log(fDiv, cpDiv, cursor.x, cursor.y);
      fDiv.style.left = cursor.x + "px";
      fDiv.style.top = cursor.y + "px";
      cpDiv.style.left = cursor.x + "px";
      cpDiv.style.top = cursor.y + "px";
    }

    // cursor show hide on visitor side
    if (
      meetingVariables.userRole === "visitor" &&
      meetingId === data[index].meetingId
    ) {
      if (data[index].cursor.showCursor) mouse.show();
      else mouse.hide();
    }
  });
};

const checkConnectedUsers = () => {};

const browserName = (function (agent) {
  switch (true) {
    case agent.indexOf("edge") > -1:
      return "MS Edge";
    case agent.indexOf("edg/") > -1:
      return "Edge ( chromium based)";
    case agent.indexOf("opr") > -1 && !!window.opr:
      return "Opera";
    case agent.indexOf("chrome") > -1 && !!window.chrome:
      return "Chrome";
    case agent.indexOf("trident") > -1:
      return "MS IE";
    case agent.indexOf("firefox") > -1:
      return "Mozilla Firefox";
    case agent.indexOf("safari") > -1:
      return "Safari";
    default:
      return "other";
  }
})(window.navigator.userAgent.toLowerCase());

const browserVersion = (function (agent) {
  switch (true) {
    case agent.indexOf("edge") > -1:
      return `${agent.split("edge")[1]}`;
    case agent.indexOf("edg/") > -1:
      return `${agent.split("edg/")[1]}`;
    case agent.indexOf("opr") > -1 && !!window.opr:
      return `${agent.split("opr/")[1]}`;
    case agent.indexOf("chrome") > -1 && !!window.chrome:
      return `${agent.split("chrome/")[1]}`;
    case agent.indexOf("trident") > -1:
      return `${agent.split("trident/")[1]}`;
    case agent.indexOf("firefox") > -1:
      return `${agent.split("firefox/")[1]}`;
    case agent.indexOf("safari") > -1:
      return `${agent.split("safari/")[1]}`;
    default:
      return "other";
  }
})(window.navigator.userAgent.toLowerCase());

const submit = async () => {
  socket = io.connect(socketUrl, { query: { appId } });

  const visitorDevice = {
    browser: navigator?.userAgentData?.brands[2]?.brand || browserName,
    browserVersion:
      navigator?.userAgentData?.brands[2]?.version || browserVersion,
    platform: navigator?.platform,
    networkDownlink: navigator?.connection?.downlink,
    networkEffectiveType: navigator?.connection?.effectiveType,
    vendor: navigator?.vendor,
    screenResolution: window?.screen?.width + "x" + window?.screen?.height,
    screenWidth: window?.screen?.width,
    screenHeight: window?.screen?.height,
  };

  const visitorPosition = await getCursorLocation(event);

  const visitor = {
    name: document.querySelector('[name="name"]').value,
    email: document.querySelector('[name="email"]').value,
    // phone_no: document.querySelector('[name="phone_no"]').value,
    inquiry_type: document.querySelector('[name="inquiry_type"]').value,
    message: document.querySelector('[name="message"]').value,
    website_domain: document.location.origin,
    visitorDevice: visitorDevice,
    visitorPosition: visitorPosition,
    locationHref: window.location.href,
  };

  console.log("visitor", visitor); //return
  if (
    visitor.name === "" ||
    visitor.email === "" ||
    visitor.message === "" ||
    visitor.inquiry_type === ""
  ) {
    alert("Please fill the required fields");
  } else {
    socket.emit("VisitorRequestMeet", visitor, (response) => {
      console.log("visitorRequestMeet", response); // ok

      if (!response.status) {
        alert(response.message + " ___ We will contact you soon through email");
        sentInquiryToDb(visitor);
      } else {
        meetingObj.connect();
        closeModal();
        socket.on("userResponseToVisitor", (data, event) => {
          console.log("userResponseToVisitor...", data);
          if (meetingVariables.id) return; // already joined the meeting
          meetingVariables.id = data.meetingId;
          meetingVariables.token = data.token;
          meetingVariables.name = data.liveMeet.name;

          let visitor = {
            userName: data.liveMeet.name,
            domain: data.liveMeet?.website_domain,
            meetingId: data.liveMeet?.video_sdk?.meeting?.meetingId,
            token: data.liveMeet?.video_sdk?.token,
            visitorSocketId: data.liveMeet?.visitor_socket_id,
            visitorPosition: {},
          };

          socket?.emit("visitorJoinLive", visitor);
          connectedUsers();
          if (data)
            setTimeout(() => {
              meetingObj.joinMeeting(); // in one sec, visitor is able to joining the meeting
            }, 1000);
        });
      }
    });
  }
};

const getCursorLocation = async (event) => {
  const { clientX, clientY } = event;
  let x = clientX;
  let y = clientY;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  return { x, y, windowWidth, windowHeight };
};

const getWindowSize = () => {
  const { innerWidth, innerHeight } = window;
  return { innerWidth, innerHeight };
};

const meetingObj = {
  meeting: null,
  isMicOn: false,
  isWebCamOn: false,
  connect() {
    const videoConfigDiv = document.createElement("div");
    videoConfigDiv.setAttribute("id", "video-sdk-config");
    document.body.prepend(videoConfigDiv);

    fetch(`${CDNlink}pages/configuration.html`)
      .then((response) => {
        return response.text();
      })
      .then((html) => {
        videoConfigDiv.innerHTML = html;
        videoContainer = document.getElementById("mtx-video-container");
        configurationCoverDiv = document.getElementById(
          "mtx-configuration-cover"
        );
        gridScreenDiv = document.getElementById("mtx-grid-screen");
        contorlsDiv = document.getElementById("controls");
        marketrixButton.classList.add("mtx-hidden");
      });
  },

  initializeMeeting: () => {
    window.VideoSDK.config(meetingVariables.token);

    meetingObj.meeting = window.VideoSDK.initMeeting({
      meetingId: meetingVariables.id, // required
      name: meetingVariables.name, // required
      micEnabled: true, // optional, default: true
      webcamEnabled: true, // optional, default: true
    });

    meetingObj.meeting.join();

    // Creating local participant
    meetingObj.createLocalParticipant();

    // Setting local participant stream
    meetingObj.meeting.localParticipant.on("stream-enabled", (stream) => {
      meetingObj.setTrack(
        stream,
        null,
        meetingObj.meeting.localParticipant,
        true
      );
    });

    // meeting joined event
    meetingObj.meeting.on("meeting-joined", () => {
      gridScreenDiv.classList.remove("mtx-hidden");
      console.log(
        "decode user role",
        decodedObject?.userRole,
        meetingVariables.userRole
      );
      if (decodedObject?.userRole === "admin") {
        connectUserToLive(decodedObject);
        console.log("coming inside even its visitor");
        const showCursorDiv = document.getElementById("show-cursor");
        showCursorDiv.classList.remove("mtx-hidden");
      } // if admin joined, it'll emit to visitor
    });

    // meeting left event
    meetingObj.meeting.on("meeting-left", () => {
      videoContainer.innerHTML = "";
    });

    // Remote participants Event
    // participant joined
    meetingObj.meeting.on("participant-joined", (participant) => {
      let videoElement = meetingObj.createVideoElement(
        participant.id,
        participant.displayName
      );
      meetingVariables.participant.remoteId = participant.id;
      let audioElement = meetingObj.createAudioElement(participant.id);
      const remoteId = meetingVariables.participant.remoteId;
      // stream-enabled
      participant.on("stream-enabled", (stream) => {
        console.log("enabled", stream);
        const kind = stream.kind;
        const aiDiv = document.getElementById(`ai-${remoteId}`);
        if (kind === "audio") {
          aiDiv.classList.remove("fa");
          aiDiv.classList.remove("fa-microphone-slash");
          aiDiv.classList.add("fa-solid");
          aiDiv.classList.add("fa-microphone");
        } else {
          console.log("enabled video");
        }
        meetingObj.setTrack(stream, audioElement, participant, false);
      });

      participant.on("stream-disabled", (stream) => {
        console.log("disabled", stream);
        const kind = stream.kind;
        const aiDiv = document.getElementById(`ai-${remoteId}`);
        if (kind === "audio") {
          aiDiv.classList.add("fa");
          aiDiv.classList.add("fa-microphone-slash");
          aiDiv.classList.remove("fa-solid");
          aiDiv.classList.remove("fa-microphone");
        } else {
          console.log("disable video");
        }
        meetingObj.setTrack(stream, audioElement, participant, false);
      });

      // creaste cursor pointer
      let cursorPointerDiv = document.createElement("div");
      let cursorPointer = document.createElement("img");
      cursorPointer.setAttribute("src", `${CDNlink}/assets/images/pointer.png`);
      cursorPointer.classList.add("mtx-remote-cursor");
      cursorPointerDiv.classList.add("mtx-remote-cursor-png-div");
      cursorPointerDiv.classList.add("mtx-hidden");
      cursorPointerDiv.setAttribute("id", `cp-${participant.id}`); // remote id
      cursorPointerDiv.appendChild(cursorPointer);

      videoContainer.append(cursorPointerDiv);
      videoContainer.append(videoElement);
      videoContainer.append(audioElement);
    });

    // participants left
    meetingObj.meeting.on("participant-left", (participant) => {
      let vElement = document.getElementById(`f-${participant.id}`);
      vElement.remove(vElement);

      let aElement = document.getElementById(`a-${participant.id}`);
      aElement.remove(aElement);
    });
  },

  createLocalParticipant: () => {
    let localParticipant = meetingObj.createVideoElement(
      meetingObj.meeting.localParticipant.id,
      meetingObj.meeting.localParticipant.displayName
    );
    meetingVariables.participant.localId =
      meetingObj.meeting.localParticipant.id;
    let localAudioElement = meetingObj.createAudioElement(
      meetingObj.meeting.localParticipant.id
    );
    videoContainer.append(localParticipant);
    videoContainer.append(localAudioElement);
  },

  setTrack: (stream, audioElement, participant, isLocal) => {
    console.log(isLocal, stream, audioElement, participant);
    if (stream.kind == "video") {
      meetingObj.isWebCamOn = true;
      const mediaStream = new MediaStream();
      mediaStream.addTrack(stream.track);
      let videoElm = document.getElementById(`v-${participant.id}`);
      videoElm.srcObject = mediaStream;
      videoElm
        .play()
        .catch((error) =>
          console.error("videoElem.current.play() failed", error)
        );
    }
    if (stream.kind == "audio") {
      if (isLocal) {
        isMicOn = true;
      } else {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(stream.track);
        audioElement.srcObject = mediaStream;
        audioElement
          .play()
          .catch((error) => console.error("audioElem.play() failed", error));
      }
    }
  },

  createVideoElement: (pId, name) => {
    let videoFrame = document.createElement("div");
    videoFrame.setAttribute("id", `f-${pId}`);
    videoFrame.classList.add("mtx-col-6");
    videoFrame.classList.add("mtx-outer-frame");

    //create video
    let videoElement = document.createElement("video");
    videoElement.classList.add("mtx-video-frame");
    videoElement.setAttribute("id", `v-${pId}`);
    videoElement.setAttribute("playsinline", true);

    videoFrame.appendChild(videoElement);

    let displayName = document.createElement("div");
    displayName.classList.add("user-names");
    displayName.innerHTML = `${name}`;

    let audioElementDiv = document.createElement("i");
    audioElementDiv.setAttribute("id", `ai-${pId}`);
    audioElementDiv.classList.add("fa-solid");
    audioElementDiv.classList.add("fa-microphone");
    audioElementDiv.classList.add("mtx-ml-2");
    displayName.appendChild(audioElementDiv);

    videoFrame.appendChild(displayName);
    return videoFrame;
  },

  createAudioElement: (pId) => {
    let audioElement = document.createElement("audio");
    audioElement.setAttribute("autoPlay", "false");
    audioElement.setAttribute("playsInline", "true");
    audioElement.setAttribute("controls", "false");
    audioElement.setAttribute("id", `a-${pId}`);
    audioElement.style.display = "none";
    return audioElement;
  },

  joinMeeting: () => {
    const waitTextDiv = document.getElementById("wait-text");
    waitTextDiv.classList.add("mtx-hidden");
    configurationCoverDiv.classList.remove("mtx-hidden");
    // $("#join-screen").css("display", "none")
    mouse.hide();
    // meetingVariables.id = roomId;

    meetingObj.initializeMeeting();
  },

  leaveMeeting: () => {
    meetingObj.meeting?.leave();
    const videoSdkConfigDiv = document.getElementById("video-sdk-config");
    const waitTextDiv = document.getElementById("wait-text");
    gridScreenDiv.classList.add("mtx-hidden"); // hide
    // $("#join-screen").css("display", "block")
    videoSdkConfigDiv.remove();
    waitTextDiv.classList.add("mtx-hidden");
    marketrixButton.classList.remove("mtx-hidden");
    meetingVariables.participant.localId = "";
    meetingVariables.participant.remoteId = "";
    meetingVariables.id = "";
  },

  toggle: {
    mic: () => {
      const localId = meetingVariables.participant.localId;
      const micIconElem = document.getElementById("mic-icon");
      const aiDiv = document.getElementById(`ai-${localId}`);
      if (meetingObj.isMicOn) {
        // Disable Mic in Meeting
        meetingObj.meeting?.muteMic();
        micIconElem.classList.add("fa");
        micIconElem.classList.add("fa-microphone-slash");
        aiDiv.classList.add("fa");
        aiDiv.classList.add("fa-microphone-slash");

        micIconElem.classList.remove("fa-solid");
        micIconElem.classList.remove("fa-microphone");
        aiDiv.classList.remove("fa-microphone");
        aiDiv.classList.remove("fa-microphone");
      } else {
        // Enable Mic in Meeting
        meetingObj.meeting?.unmuteMic();
        micIconElem.classList.add("fa-solid");
        micIconElem.classList.add("fa-microphone");
        aiDiv.classList.add("fa-solid");
        aiDiv.classList.add("fa-microphone");

        micIconElem.classList.remove("fa");
        micIconElem.classList.remove("fa-microphone-slash");
        aiDiv.classList.remove("fa");
        aiDiv.classList.remove("fa-microphone-slash");
      }
      meetingObj.isMicOn = !meetingObj.isMicOn;
    },

    webCam: () => {
      const localId = meetingVariables.participant.localId;
      const fDiv = document.getElementById(`f-${localId}`);
      const webCamIconElem = document.getElementById("webcam-icon");
      if (meetingObj.isWebCamOn) {
        meetingObj.meeting?.disableWebcam();
        fDiv.style.display = "none";
        webCamIconElem.classList.add("fa-solid");
        webCamIconElem.classList.add("fa-video-slash");
        webCamIconElem.classList.remove("fas");
        webCamIconElem.classList.remove("fa-video");
      } else {
        meetingObj.meeting?.enableWebcam();
        fDiv.style.display = "inline";
        webCamIconElem.classList.remove("fa-solid");
        webCamIconElem.classList.remove("fa-video-slash");
        webCamIconElem.classList.add("fas");
        webCamIconElem.classList.add("fa-video");
      }
      meetingObj.isWebCamOn = !meetingObj.isWebCamOn;
    },
  },
};

const sentInquiryToDb = (data) => {
  let currentUrl = window.location.hostname;

  let inquiry = {
    name: data.name,
    designation: data.designation,
    company: data.company,
    email: data.email,
    phone_no: data.phone,
    message: data.message,
    inquiry_type: data.inquiryType,
    inquiry_status: "requested",
    website_domain: currentUrl,
    app_id: appId,
  };

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  };
  fetch(`${serverBaseUrl}meet-live/inquiries/create`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      console.log("data", data);
    });
};

const mouse = {
  cursor: {
    x: "",
    y: "",
    windowWidth: "",
    windowHeight: "",
    showCursor: false,
  },
  showCursor: false,
  startMove: () => {
    document.onmousemove = mouse.handleMouse;
  },
  show: () => {
    if (mouse.showCursor && meetingVariables.userRole !== "visitor") {
      mouse.hide();
      return;
    } // if its is already in marketrixMode, it would be changed to the focusmode
    // $(".mouse").show()
    const localId = meetingVariables.participant.localId;
    const remoteId = meetingVariables.participant.remoteId;
    const remoteCursorDiv = document.getElementById(`cp-${remoteId}`);
    const showCursorDiv = document.getElementById("show-cursor");

    configurationCoverDiv.classList.add("mtx-hidden");
    contorlsDiv.classList.add("mtx-hidden");
    showCursorDiv.classList.add("mtx-mode");
    if (meetingVariables.userRole === "admin") mouse.showCursor = true; // admin make the cursor movement on both side
    mouse.startMove();
    console.log("local participant id", meetingVariables.participant.localId);
    console.log("remote participant id", meetingVariables.participant.remoteId);

    remoteCursorDiv.classList.remove("mtx-hidden"); // show

    if (localId) {
      const fLocalDiv = document.getElementById(`f-${localId}`);
      const vLocalDiv = document.getElementById(`v-${localId}`);
      fLocalDiv.style.position = "absolute";
      fLocalDiv.classList.add("mtx-moving-outer-frame");
      fLocalDiv.classList.add("mtx-local-moving-outer-frame");

      vLocalDiv.classList.add("mtx-moving-video-frame");
      vLocalDiv.classList.remove("mtx-video-frame");
      fLocalDiv.style.marginTop = "-590px";
    }

    if (remoteId) {
      const fRemoteDiv = document.getElementById(`f-${remoteId}`);
      const vRemoteDiv = document.getElementById(`v-${remoteId}`);
      fRemoteDiv.style.position = "absolute";
      fRemoteDiv.classList.add("mtx-moving-outer-frame");
      fRemoteDiv.classList.add("mtx-remote-moving-outer-frame");

      vRemoteDiv.classList.add("mtx-moving-video-frame");
      vRemoteDiv.classList.remove("mtx-video-frame");
      fRemoteDiv.style.marginTop = "-550px";
      remoteCursorDiv.style.marginTop = "-539px";
    }
  },
  hide: () => {
    // $(".mouse").hide()
    const localId = meetingVariables.participant.localId;
    const remoteId = meetingVariables.participant.remoteId;
    const remoteCursorDiv = document.getElementById(`cp-${remoteId}`);
    const showCursorDiv = document.getElementById("show-cursor");

    configurationCoverDiv.classList.remove("mtx-hidden");
    contorlsDiv.classList.remove("mtx-hidden");
    showCursorDiv.classList.remove("mtx-mode");

    console.log("local id", localId);
    console.log("remote id", remoteId);

    if (localId) {
      const fLocalDiv = document.getElementById(`f-${localId}`);
      const vLocalDiv = document.getElementById(`v-${localId}`);

      fLocalDiv.style.position = "";
      fLocalDiv.style.marginTop = "";
      fLocalDiv.style.left = "";
      fLocalDiv.style.top = "";

      fLocalDiv.classList.remove("mtx-moving-outer-frame");
      fLocalDiv.classList.remove("mtx-local-moving-outer-frame");

      vLocalDiv.classList.remove("mtx-moving-video-frame");
      vLocalDiv.classList.add("mtx-video-frame");
    }
    if (remoteId) {
      const fRemoteDiv = document.getElementById(`f-${remoteId}`);
      const vRemoteDiv = document.getElementById(`v-${remoteId}`);

      fRemoteDiv.style.position = "";
      fRemoteDiv.style.marginTop = "";
      fRemoteDiv.style.left = "";
      fRemoteDiv.style.top = "";

      fRemoteDiv.classList.remove("mtx-moving-outer-frame");
      fRemoteDiv.classList.remove("mtx-remote-moving-outer-frame");

      vRemoteDiv.classList.remove("mtx-moving-video-frame");
      vRemoteDiv.classList.add("mtx-video-frame");

      remoteCursorDiv.classList.add("mtx-hidden"); // hide
    }
    if (meetingVariables.userRole === "admin") mouse.showCursor = false;
  },
  handleMouse: (event) => {
    let x = event.pageX;
    let y = event.pageY;
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    // console.log(event)
    // return; // test console log
    mouse.cursor.x = x;
    mouse.cursor.y = y;
    mouse.cursor.windowHeight = windowHeight;
    mouse.cursor.windowWidth = windowWidth;

    mouse.cursor.showCursor = mouse.showCursor;

    const localId = meetingVariables.participant.localId;
    const remoteId = meetingVariables.participant.remoteId;

    if (localId && mouse.showCursor) {
      const fLocalDiv = document.getElementById(`f-${localId}`);
      fLocalDiv.style.left = x + "px";
      fLocalDiv.style.top = y + "px";
    }

    socket.emit(
      "cursorPosition",
      mouse.cursor,
      meetingVariables.id,
      (response) => {
        // console.log("cursorPosition-send", response); // ok
      }
    );
  },
};

const openCam = () => {
  let All_mediaDevices = navigator.mediaDevices;
  if (!All_mediaDevices || !All_mediaDevices.getUserMedia) {
    console.log("getUserMedia() not supported.");
    return;
  }
  All_mediaDevices.getUserMedia({
    audio: true,
    video: true,
  })
    .then(function (vidStream) {
      video = document.getElementById("videoCam");
      if ("srcObject" in video) {
        video.srcObject = vidStream;
      } else {
        video.src = window.URL.createObjectURL(vidStream);
      }
      video.onloadedmetadata = function (e) {
        video.play();
        mouse.startMove();
      };
    })
    .catch(function (e) {
      console.log(e.name + ": " + e.message);
    });
};
