console.log("socket.js is established #3");
const SOCKET = {
  on: {
    changeUrl: () => {
      socket.on("changeUrl", (data) => {
        changedUrl = data.url;
        setToStore("CURRENT_URL", changedUrl);
        window.location.href = changedUrl;
      });
    },
    changeScroll: () => {
      socket?.on("changeScroll", (data) => {
        console.log("scroll on");
        const windowWidth = getWindowSize().innerWidth;
        const windowHeight = getWindowSize().innerHeight;
        const scroll = data.scroll;

        let pageX = scroll.pageX;
        let pageY = scroll.pageY;

        pageX = (pageX / 100) * windowWidth; // get actual pageX from pageX percentage
        pageY = (pageY / 100) * windowHeight; // get actual pageY from pageY percentage
        scrollEnded = true;
        remoteScroll = true;
        window.scrollTo(pageX, pageY);

        setTimeout(() => {
          remoteScroll = false;
        }, 1000);
      });
    },
    meetingEnded: () => {
      socket.on("meetingEnded", (data) => {
        console.log("admin end the meeting");
        meetingObj.leaveMeeting();
      });
    },
    connectedUser: () => {
      mouse.showCursor = getFromStore("MARKETRIX_MODE");
      socket.on("connectedUsers", (data) => {
        // console.log("connectedUsers..........", data);
        if (meetingEnded) {
          meetingEnded = false;
          setToStore("MEETING_ENDED", meetingEnded);
          visitorJoin();
        }

        const localUserRole = meetingVariables.userRole;
        // console.log("local user role", localUserRole);
        // console.log("meeting id", meetingVariables.id)
        const index = data.findIndex(
          (r) =>
            r.userRole !== localUserRole && r.meetingId === meetingVariables.id
        );
        // console.log("connected users index", index)
        if (index >= 0) {
          const cursor = data[index].cursor;
          // console.log(cursor, data[index].userRole, localUserRole);
          const remoteId = meetingVariables.participant.remoteId;
          const meetingId = meetingVariables.id;
          mouse.showCursor = getFromStore("MARKETRIX_MODE"); //cursor.showCursor
          if (remoteId && /true/.test(mouse.showCursor)) {
            // use marketrxiMode instead
            const fDiv = document.getElementById(`f-${remoteId}`);
            const cpDiv = document.getElementById(`cp-${remoteId}`);

            let windowWidth = getWindowSize().innerWidth;
            let widthRatio = windowWidth / cursor.windowWidth;

            let windowHeight = getWindowSize().innerHeight;
            let heightRatio = windowHeight / cursor.windowHeight;

            cursor.x = cursor.x * widthRatio; //(cursor.x / 100) * windowWidth
            cursor.y = cursor.y * heightRatio; //(cursor.y / 100) * windowHeight

            fDiv.style.left = cursor.x + "px";
            fDiv.style.top = cursor.y + "px";
            cpDiv.style.left = cursor.x + "px";
            cpDiv.style.top = cursor.y + "px";
          }
        }
      });
    },
    userResopnseToVisitor: () => {
      socket.on("userResponseToVisitor", (data, event) => {
        if (/false/.test(getFromStore("MEETING_ENDED"))) return;
        console.log("userResponseToVisitor...", data);
        adminMessage = data.message;
        adminName = data.userName;
        meetingEnded = false;
        setToStore("MEETING_ENDED", meetingEnded);
        adminConnects = true;
        console.log("meetingId", meetingVariables.id);
        // if (meetingVariables.id) return; // already joined the meeting
        meetingVariables.id = data.meetingId;
        meetingVariables.token = data.token;
        meetingVariables.name = data.liveMeet.name;
        meetingVariables.domain = data.liveMeet?.website_domain;
        meetingVariables.visitorSocketId = data.liveMeet?.visitor_socket_id;
        visitorJoin();
      });
    },
    changeMode: () => {
      socket.on("changeMode", (data) => {
        console.log("mode change", data, data.mode);
        setToStore("MARKETRIX_MODE", data.mode);
        if (/true/.test(data.mode)) {
          mouse.show();
        } else mouse.hide();
      });
    },
    emitActiveAgents: () => {
      socket.on("emitActiveAgents", (data) => {
        console.log("emitActiveAgents", data);
        if (data == true) {
          isAgentAvailable = true;
        } else {
          isAgentAvailable = false;
        }
      });
    },
  },
  emit: {
    urlChange: () => {
      socket.emit("urlChange", {
        meetingId: meetingVariables.id,
        url: currentUrl,
      });
    },
    scrollChange: (scroll) => {
      console.log("scrolling", cursorId);
      socket.emit("scrollChange", {
        scroll,
        cursorId,
        meetingId: meetingVariables.id,
      });
    },
    endMeeting: () => {
      socket.emit("endMeeting", {
        meetingId: meetingVariables.id,
        isAdmin: "true",
      });
    },
    cursorPosition: (mouse, cursorId) => {
      socket?.emit(
        "cursorPosition",
        mouse.cursor,
        meetingVariables.id,
        cursorId,
        (response) => {
          // console.log("cursorPosition-send", response); // ok
        }
      );
    },
    userJoinLive: (meetInfo) => {
      socket.emit("userJoinLive", meetInfo);
    },
    getActiveAgents: () => {
      socket.emit("getActiveAgents");
    },
    visitorRequestMeet: (visitor) => {
      console.log("isAgentAvailable", isAgentAvailable);

      if (isAgentAvailable == true) {
        visitor.visitor_socket_id = socket.id;
        visitor.inquiry_status = "incoming";
        console.log("visitorRequestMeet", visitor);
        sentInquiryToDb(visitor);
        socket.emit("VisitorRequestMeet", visitor);
        mtxContactFormNotificationCard.classList.remove("mtx-hidden");
        mtxFormContent.classList.add("mtx-hidden");
        mtxFormCloseBtn.classList.add("mtx-hidden");
        showNotification();
        SOCKET.on.userResopnseToVisitor();
      } else {
        mtxContactFormNotificationCard.classList.remove("mtx-hidden");
        mtxFormContent.classList.add("mtx-hidden");
        // mtxFormCloseBtn.classList.add("mtx-hidden")
        visitor.inquiry_status = "missed";
        showNotification(false);
        sentInquiryToDb(visitor);
      }
    },
    modeChange: (marketrixMode) => {
      console.log("mode change", marketrixMode);
      socket.emit("modeChange", marketrixMode);
    },
    connectVisitor: (visitor) => {
      socket.emit("connectVisitor", visitor);
    },
  },
};
