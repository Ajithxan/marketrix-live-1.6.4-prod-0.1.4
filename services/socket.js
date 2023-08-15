console.log("socket.js is established")
const SOCKET = {
    on: {
        changeUrl: () => {
            socket.on("changeUrl", (data) => {
                changedUrl = data.url
                setToStore("CURRENT_URL", changedUrl)
                window.location.href = changedUrl
            })
        },
        changeScroll: () => {
            socket?.on("changeScroll", (data) => {
                console.log("scroll on", data)
                const windowWidth = getWindowSize().innerWidth
                const windowHeight = getWindowSize().innerHeight
                const scroll = data.scroll

                let pageX = scroll.pageX
                let pageY = scroll.pageY

                pageX = (pageX / 100) * windowWidth // get actual pageX from pageX percentage
                pageY = (pageY / 100) * windowHeight // get actual pageY from pageY percentage
                window.scrollTo(pageX, pageY)
            })
        },
        meetingEnded: () => {
            socket.on("meetingEnded", (data) => {
                console.log("admin end the meeting")
                meetingObj.leaveMeeting()
            })
        },
        connectedUser: () => {
            mouse.showCursor = getFromStore("MARKETRIX_MODE")
            socket.on("connectedUsers", (data) => {
                // console.log("connectedUsers..........", data);

                const localUserRole = meetingVariables.userRole;
                // console.log("local user role", localUserRole);
                // console.log("meeting id", meetingVariables.id)
                const index = data.findIndex(
                    (r) => r.userRole !== localUserRole && r.meetingId === meetingVariables.id
                );
                // console.log("connected users index", index)                
                if (index >= 0) {
                    const cursor = data[index].cursor;
                    // console.log(cursor, data[index].userRole, localUserRole);
                    const remoteId = meetingVariables.participant.remoteId;
                    const meetingId = meetingVariables.id;
                    mouse.showCursor = getFromStore("MARKETRIX_MODE") //cursor.showCursor
                    console.log("mouse.showCursor", mouse.showCursor)
                    if (remoteId && (/true/).test(mouse.showCursor)) { // use marketrxiMode instead
                        console.log("coming inside the remote cursor movements")
                        const fDiv = document.getElementById(`f-${remoteId}`);
                        const cpDiv = document.getElementById(`cp-${remoteId}`);

                        let windowWidth = getWindowSize().innerWidth;
                        let widthRatio = windowWidth / cursor.windowWidth;

                        let windowHeight = getWindowSize().innerHeight;
                        let heightRatio = windowHeight / cursor.windowHeight;

                        fDiv.style.left = (cursor.x * widthRatio) + "px";
                        fDiv.style.top = (cursor.y * heightRatio)
                            + "px";
                        cpDiv.style.left = (cursor.x * widthRatio) + "px";
                        cpDiv.style.top = (cursor.y * heightRatio)
                            + "px";
                    }

                    // cursor show hide on visitor side
                    // if (
                    //     meetingVariables.userRole === "visitor" &&
                    //     meetingId === data[index].meetingId
                    // ) {
                    //     if (data[index].cursor.showCursor) mouse.show();
                    //     else mouse.hide();
                    // }
                }
            });
        },
        userResopnseToVisitor: () => {
            socket.on("userResponseToVisitor", (data, event) => {
                console.log("userResponseToVisitor...", data);
                if (meetingVariables.id) return; // already joined the meeting
                meetingVariables.id = data.meetingId;
                meetingVariables.token = data.token;
                meetingVariables.name = data.liveMeet.name;
                meetingVariables.domain = data.liveMeet?.website_domain
                meetingVariables.visitorSocketId = data.liveMeet?.visitor_socket_id
                visitorJoin()
            });
        },
        changeMode: () => {
            socket.on("changeMode", (data) => {
                console.log("mode change", data, data.mode)
                setToStore("MARKETRIX_MODE", data.mode)
                if ((/true/).test(data.mode)) { mouse.show(); }
                else mouse.hide();
            })
        }
    },
    emit: {
        urlChange: () => {
            socket.emit("urlChange", {
                meetingId: meetingVariables.id,
                url: currentUrl
            });
        },
        scrollChange: (scroll) => {
            socket.emit("scrollChange", { scroll, meetingId: meetingVariables.id })
        },
        endMeeting: () => {
            socket.emit("endMeeting", { meetingId: meetingVariables.id, isAdmin: "true" })
        },
        cursorPosition: (mouse, cursorId) => {
            socket.emit(
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
            socket.emit("userJoinLive", meetInfo)
        },
        visitorRequestMeet: (visitor) => {
            socket.emit("VisitorRequestMeet", visitor, (response) => {
                console.log("visitorRequestMeet", response); // ok

                if (!response.status) {
                    alert(response.message + " ___ We will contact you soon through email");
                    visitor.inquiryStatus   = "missed" 
                    sentInquiryToDb(visitor);
                } else {
                    visitor.inquiryStatus   = "incoming" 
                    sentInquiryToDb(visitor);
                    mtxContactFormNotificationCard.classList.remove("mtx-hidden")
                    mtxFormContent.classList.add("mtx-hidden")
                    mtxFormCloseBtn.classList.add("mtx-hidden")
                    showNotification()
                    SOCKET.on.userResopnseToVisitor()
                }
            });
        },
        modeChange: (marketrixMode) => {
            console.log("mode change", marketrixMode)
            socket.emit("modeChange", marketrixMode)
        }
    }
}