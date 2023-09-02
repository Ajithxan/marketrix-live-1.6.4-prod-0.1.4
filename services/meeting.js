console.log("meeting.js is established #7");
const meetingObj = {
  meeting: null,
  isMicOn: true,
  isWebCamOn: false,
  connect() {
    if (
      /true/.test(getFromStore("MEETING_ENDED")) &&
      meetingVariables.userRole === "visitor"
    )
      return;
    const videoConfigDiv = document.createElement("div");
    videoConfigDiv.setAttribute("id", "video-sdk-config");
    document.body.prepend(videoConfigDiv);
    mtxConnectBtn.classList.add("mtx-hidden");
    mtxEndCallBtn.classList.remove("mtx-hidden");

    meetingEnded = false;
    setToStore("MEETING_ENDED", meetingEnded);

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
        cursorLoading = document.getElementById("cursor-loading");
        marketrixButton?.classList.add("mtx-hidden");
        mouse.loading.show();
        setCDNLink();
        setTimeout(() => {
          meetingObj.joinMeeting();
        }, 1000);
      });
  },

  initializeMeeting: () => {
    if (meetingVariables.token) {
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
        gridScreenDiv?.classList.remove("mtx-hidden");
        console.log("decode user role", meetingVariables.userRole);
        if (meetingVariables.userRole === "admin") {
          console.log("decode object =>", decodedObject);
          connectUserToLive(decodedObject);
          console.log("coming inside even its visitor");
          const showCursorDiv = document.getElementById("show-cursor");
          showCursorDiv.classList.remove("mtx-hidden");
        } // if admin joined, it'll emit to visitor
      });

      // meeting left event
      meetingObj.meeting.on("meeting-left", () => {
        console.log("meeting left event called");
        videoContainer.innerHTML = "";
      });

      meetingObj.meeting.on("participant-left", (participant) => {
        mouse.loading.show();
        console.log("participant left", participant);
      });

      // Remote participants Event
      // participant joined
      meetingObj.meeting.on("participant-joined", (participant) => {
        console.log("particpant joined");
        mouse.loading.hide();
        let videoElement = meetingObj.createVideoElement(
          participant.id,
          participant.displayName
        );
        meetingVariables.participant.remoteId = participant.id;
        setToStore("MEETING_VARIABLES", JSON.stringify(meetingVariables)); // store meeting variables
        let audioElement = meetingObj.createAudioElement(participant.id);
        const remoteId = meetingVariables.participant.remoteId;

        // stream-enabled
        participant.on("stream-enabled", (stream) => {
          const kind = stream.kind;
          const aiDiv = document.getElementById(`ai-${remoteId}`);
          if (kind === "audio") {
            aiDiv.classList.remove("fa");
            aiDiv.classList.remove("fa-microphone-slash");
            aiDiv.classList.add("fa-solid");
            aiDiv.classList.add("fa-microphone");
          } else {
            console.log("enabled video with f-remoteid");
            document
              .getElementById(`v-${remoteId}`)
              .classList.remove("mtx-hidden");
            document
              .getElementById(`vd-${remoteId}`)
              .classList.add("mtx-hidden");
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
            console.log(
              "disable video with f-remoteid",
              "local user role",
              meetingVariables.userRole
            );
            if (meetingVariables.userRole === "visitor") {
              console.log(
                "coming inside the userrole of visitor when disable the video"
              );
              const videoDisabledImageOfAdmin = document.getElementById(
                `vdi-${remoteId}`
              );
              videoDisabledImageOfAdmin.setAttribute(
                "src",
                `${CDNlink}assets/images/profile.png`
              ); // set admin profile here
            }
            document
              .getElementById(`v-${remoteId}`)
              .classList.add("mtx-hidden");
            document
              .getElementById(`vd-${remoteId}`)
              .classList.remove("mtx-hidden");
          }
          meetingObj.setTrack(stream, audioElement, participant, false);
        });

        // creaste cursor pointer
        let cursorPointerDiv = document.createElement("div");
        let cursorPointer = document.createElement("img");
        cursorPointer.setAttribute(
          "src",
          `${CDNlink}/assets/images/pointer.png`
        );
        cursorPointer.classList.add("mtx-remote-cursor");
        cursorPointerDiv.classList.add("mtx-remote-cursor-png-div");
        cursorPointerDiv.classList.add("mtx-hidden");
        cursorPointerDiv.setAttribute("id", `cp-${participant.id}`); // remote id
        cursorPointerDiv.appendChild(cursorPointer);

        videoContainer.append(cursorPointerDiv);
        videoContainer.append(videoElement);
        videoContainer.append(audioElement);

        console.log("meeting connect", mouse.showCursor);
        if (/true/.test(mouse.showCursor) || /null/.test(mouse.showCursor))
          mouse.show();
        else {
          mouse.hide();
          videoContainer.classList.remove("mtx-hidden");
          videoContainer.style.height = "0vh";
        }
      });

      // participants left
      meetingObj.meeting.on("participant-left", (participant) => {
        let vElement = document.getElementById(`f-${participant.id}`);
        vElement.remove(vElement);

        let aElement = document.getElementById(`a-${participant.id}`);
        aElement.remove(aElement);
      });
    }
  },

  createLocalParticipant: () => {
    let localParticipant = meetingObj.createVideoElement(
      meetingObj.meeting.localParticipant.id,
      meetingObj.meeting.localParticipant.displayName
    );
    meetingVariables.participant.localId =
      meetingObj.meeting.localParticipant.id;
    setToStore("MEETING_VARIABLES", JSON.stringify(meetingVariables)); // store meeting variables
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

    // video disabled
    let videoDisabledDiv = document.createElement("div");
    videoDisabledDiv.classList.add("mtx-hidden");
    videoDisabledDiv.setAttribute("id", `vd-${pId}`);

    // video disabled image
    videoDisabledImg = document.createElement("img");
    videoDisabledImg.classList.add("mtx-video-disabled-img");
    videoDisabledImg.setAttribute("id", `vdi-${pId}`);
    videoDisabledImg.setAttribute(
      "src",
      `${CDNlink}assets/images/cam-user.png`
    );

    videoDisabledDiv.appendChild(videoDisabledImg);

    videoFrame.appendChild(videoElement);
    videoFrame.appendChild(videoDisabledDiv);

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
    meetingObj.initializeMeeting();
  },

  leaveMeeting: () => {
    console.log("LEAVE________", meetingVariables);
    if (meetingVariables.userRole === "admin") {
      SOCKET.emit.endMeeting();
      meetingObj.endMeetingApiCall();
    }
    // sessionStorage.clear()
    meetingEnded = true;
    setToStore("MEETING_ENDED", meetingEnded);
    meetingObj.meeting?.end();
    if (meetingVariables.userRole === "visitor") window.location.reload();
  },

  toggle: {
    mic: () => {
      const localId = meetingVariables.participant.localId;
      const micIconElem = document.getElementById("mic-icon");
      const aiDiv = document.getElementById(`ai-${localId}`);
      console.log("meetingObj mic", meetingObj.isMicOn);
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
        // fDiv.style.display = "none";
        webCamIconElem.classList.add("fa-solid");
        webCamIconElem.classList.add("fa-video-slash");
        webCamIconElem.classList.remove("fas");
        webCamIconElem.classList.remove("fa-video");
        console.log("disabled video with f-localuserid");
        const videoDisabledImageOfAdmin = document.getElementById(
          `vdi-${localId}`
        );
        if (meetingVariables.userRole === "admin")
          videoDisabledImageOfAdmin.setAttribute(
            "src",
            `${CDNlink}assets/images/profile.png`
          ); // set admin profile image here
        document.getElementById(`v-${localId}`).classList.add("mtx-hidden");
        document.getElementById(`vd-${localId}`).classList.remove("mtx-hidden");
      } else {
        meetingObj.meeting?.enableWebcam();
        // fDiv.style.display = "inline";
        webCamIconElem.classList.remove("fa-solid");
        webCamIconElem.classList.remove("fa-video-slash");
        webCamIconElem.classList.add("fas");
        webCamIconElem.classList.add("fa-video");
        console.log("enabled video with f-localuserid");
        document.getElementById(`v-${localId}`).classList.remove("mtx-hidden");
        document.getElementById(`vd-${localId}`).classList.add("mtx-hidden");
      }
      meetingObj.isWebCamOn = !meetingObj.isWebCamOn;
    },
  },

  endMeetingApiCall: () => {
    console.log("API CALL");
    const adminToken = meetingVariables.adminToken;
    const inquiryId = meetingVariables.inquiryId;

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    };
    fetch(
      `${serverBaseUrl}meet-live/inquiries/end_session/${inquiryId}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("END CALL", data);
        setTimeout(() => {
          window.close();
        }, 1000);
      });
  },
};
