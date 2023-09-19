console.log("mouse.js is established #8")
const mouse = {
    cursor: [],
    marketrixMode: true,
    startMove: () => {
        document.onmousemove = mouse.handleMouse;
    },
    show: (localCursor = false) => {
        if ((/true/).test(adminConnects) && meetingVariables.userRole === "visitor") {
            console.log("coming inside the mouse show")
            return
        }
        console.log("mouse show is called, show cursor is", mouse.marketrixMode)
        const localId = meetingVariables.participant.localId;
        console.log("localId", localId)
        const remoteId = meetingVariables.participant.remoteId;
        const remoteCursorDiv = document.getElementById(`cp-${remoteId}`);
        const mtxModeBtn = document.getElementById("marketrix-mode-btn")
        const focusModeBtn = document.getElementById("focus-mode-btn")


        configurationCoverDiv.classList.add("mtx-hidden");
        mtxModeBtn.classList.remove("mtx-hidden")
        focusModeBtn.classList.add("mtx-hidden")

        if (meetingVariables.userRole === "admin") {
            mouse.marketrixMode = true;
            setToStore("MARKETRIX_MODE", mouse.marketrixMode)
            SOCKET.emit.modeChange({ mode: true, meetingId: meetingVariables.id })
        } // admin make the cursor movement on both side
        mouse.startMove();

        if (remoteCursorDiv) remoteCursorDiv.classList.remove("mtx-hidden"); // show

        if (localId) mouse.cursorFrameElement(localId, true, true)
        if (remoteId && !localCursor) mouse.cursorFrameElement(remoteId, false, true)
    },
    hide: (localCursor = false) => {
        const localId = meetingVariables.participant.localId;
        const remoteId = meetingVariables.participant.remoteId;
        const remoteCursorDiv = document.getElementById(`cp-${remoteId}`);
        const mtxModeBtn = document.getElementById("marketrix-mode-btn")
        const focusModeBtn = document.getElementById("focus-mode-btn")

        configurationCoverDiv.classList.remove("mtx-hidden");
        mtxModeBtn.classList.add("mtx-hidden")
        focusModeBtn.classList.remove("mtx-hidden")

        if (meetingVariables.userRole === "admin") {
            mouse.marketrixMode = false;
            setToStore("MARKETRIX_MODE", mouse.marketrixMode)
            SOCKET.emit.modeChange({ mode: false, meetingId: meetingVariables.id })
        }

        remoteCursorDiv.classList.add("mtx-hidden"); // hide

        if (localId) mouse.cursorFrameElement(localId, true, false)
        if (remoteId && !localCursor) mouse.cursorFrameElement(remoteId, false, false)
    },
    cursorFrameElement: (userId, isLocalUser, show) => {
        console.log("cursorFrameElement", userId, isLocalUser, show)
        const frameDiv = document.getElementById(`f-${userId}`);
        const vLocalDiv = document.getElementById(`v-${userId}`);
        const videoDisabledImgDiv = document.getElementById(`vdi-${userId}`)
        const videoDisabledDiv = document.getElementById(`vd-${userId}`)

        console.log("frame-div", frameDiv)

        show ? frameDiv.classList.add("start-move") : frameDiv.classList.add("stop-move")
        show ? frameDiv.classList.remove("stop-move") : frameDiv.classList.remove("start-move")
        show ? frameDiv.classList.add("mtx-moving-outer-frame") : frameDiv.classList.remove("mtx-moving-outer-frame")

        if (isLocalUser) show ? frameDiv.classList.add("mtx-local-moving-outer-frame") : frameDiv.classList.remove("mtx-local-moving-outer-frame")
        if (!isLocalUser) show ? frameDiv.classList.add("mtx-remote-moving-outer-frame") : frameDiv.classList.remove("mtx-remote-moving-outer-frame")

        show ? vLocalDiv.classList.add("mtx-moving-video-frame") : vLocalDiv.classList.remove("mtx-moving-video-frame")
        show ? vLocalDiv.classList.remove("mtx-video-frame") : vLocalDiv.classList.add("mtx-video-frame")
        show ? videoDisabledDiv.classList.add("mtx-moving-video-disabled-div") : videoDisabledDiv.classList.remove("mtx-moving-video-disabled-div")
        show ? videoDisabledDiv.classList.remove("mtx-video-disabled-div") : videoDisabledDiv.classList.add("mtx-video-disabled-div")
        show ?? videoContainer.classList.remove("mtx-hidden")
        show ? videoContainer.classList.add("mtx-mode-video-container") : videoContainer.classList.remove("mtx-mode-video-container")
    },
    handleMouse: (event) => {
        cursorMoveEnded = false
        let x = event.clientX;
        let y = event.clientY;
        let windowWidth = getWindowSize().innerWidth;
        let windowHeight = getWindowSize().innerHeight;

        const cursor = {}
        cursor.x = x;
        cursor.y = y;
        cursor.windowHeight = windowHeight;
        cursor.windowWidth = windowWidth;

        const localId = meetingVariables.participant.localId;
        const remoteId = meetingVariables.participant.remoteId;

        if (localId && (/true/).test(mouse.marketrixMode)) {
            const fLocalDiv = document.getElementById(`f-${localId}`);
            fLocalDiv.style.left = x + "px";
            fLocalDiv.style.top = y + "px";
        }

        cursorLoading.style.left = x + "px";
        cursorLoading.style.top = y + "px";

        cursorMoveCount += 1
        movementsArr.push(cursor)
        if(movementsArr.length > 0) mouse.cursor = movementsArr
    },
    loading: {
        show: () => {
            console.log("mouse loading is called")
            videoContainer.classList.add("mtx-hidden")
            mouse.startMove()
            cursorLoading.classList.remove("mtx-hidden")
        },
        hide: () => {
            videoContainer.classList.remove("mtx-hidden")
            cursorLoading.classList.add("mtx-hidden")
        }
    }
};

const emitCursorMovment = () => {
    movementsArr = []
    if (cursorMoveEnded) return
    cursorMoveEnded = true
    console.log(mouse)
    SOCKET.emit.cursorPosition(mouse, cursorId)
    // console.log(mouse.cursor)
}

// check cursor move starts and stops.
setInterval(() => {
    if (cursorMoveCount < preveCursorMoveCount || preveCursorMoveCount === 0) preveCursorMoveCount = cursorMoveCount
    else emitCursorMovment()
}, 1000)

// scroll event
let scroller = document.getElementsByTagName("body")[0]
let pageX;
let pageY;

const scrollPosition = () => {
    const windowWidth = getWindowSize().innerWidth
    const windowHeight = getWindowSize().innerHeight

    pageX = (pageX / windowWidth) * 100 // x axis percentage
    pageY = (pageY / windowHeight) * 100 // y axis percentage

    const scroll = {
        pageX,
        pageY,
        windowWidth,
        windowHeight
    }

    SOCKET.emit.scrollChange(scroll)
}

const emitScroll = () => {
    if (scrollEnded) return
    scrollEnded = true
    scrollPosition() // it would be called to emit scroll when local scroll stops.
}

// check scroll starts and stops.
setInterval(() => {
    if (scrollCount > prevScrollCount || prevScrollCount === 0) prevScrollCount = scrollCount
    else emitScroll()
}, 1000)

scroller.onscroll = () => {
    if (!remoteScroll) scrollEnded = false // prevent from emitting when remote scroll.
    scrollCount += 1
    pageX = this.scrollX
    pageY = this.scrollY
}