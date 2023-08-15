console.log("main.js is established")
const setCDNLink = () => {
    const links = document.getElementsByTagName('link')
    const imgs = document.getElementsByTagName('img')
    // change all href
    for (const link of links) {
        const linkAttr = link.getAttribute("href").replace("{{CDN_LINK}}", CDNlink)
        link.setAttribute("href", linkAttr)
    }
    // change all src
    for (const img of imgs) {
        const imgSrc = img.getAttribute("src").replace("{{CDN_LINK}}", CDNlink)
        img.setAttribute("src", imgSrc)
    }
}

const checkReady = (callback) => {
    setTimeout(() => {
        callback();
    }, 500);
};

const adminJoin = () => {
    showModal()

    // hide notfication and cursor header of form
    mtxCursorHeader.classList.add("mtx-hidden")
    mtxContactFormNotificationCard.classList.add("mtx-hidden")
    mtxFormContent.classList.add("mtx-hidden")
    mtxFormCloseBtn.classList.add("mtx-hidden")

    if (meetingVariables.id && meetingVariables.token) meetingObj.connect(); // video sdk screen is starting

    socket?.on("redirectUserToVisitor", (visitorLocation) => {
        console.log("redirecting to visitor", visitorLocation);
    });
}

const generateCursorId = () => {
    if (getFromStore("CURSOR_ID")) cursorId = getFromStore("CURSOR_ID")
    else {
        cursorId = Date.now()
        setToStore("CURSOR_ID", cursorId)
    }
    console.log('cursorId', cursorId)
}

const getQuery = () => {
    if (getFromStore('MEETING_VARIABLES')) return // these data already stored
    console.log("coming inside the get query function")
    const url = window.location.href;
    const queryString = new URL(url).searchParams.get("marketrix-meet");

    if (queryString != null) {
        const decodedString = decodeURIComponent(queryString);

        // Parse the decoded string as a JavaScript object
        decodedObject = JSON.parse(decodedString);
        console.log("decodedObject", decodedObject);

        if (decodedObject?.userRole === "admin") {
            decodedObject.cursorId = cursorId
            setToStore('DECODED_OBJECT', JSON.stringify(decodedObject)) // store decoded object
            meetingVariables.id = decodedObject.meetingId;
            meetingVariables.token = decodedObject.token;
            meetingVariables.name = decodedObject.userName;
            meetingVariables.userRole = decodedObject.userRole;
            adminJoin()
        }
    }
};

let currentUrl = window.location.href


const checkUrlChanges = () => {
    if (getFromStore('CURRENT_URL')) {
        if (currentUrl !== getFromStore('CURRENT_URL')) {
            // emit url changes
            isUrlChanged = true
        }
    }

    setToStore('CURRENT_URL', currentUrl) // set current url in the store
}

const visitorJoin = () => {
    console.log("visitor joined called")
    showModal()
    // hide notfication and cursor header of form
    mtxCursorHeader.classList.add("mtx-hidden")
    mtxContactFormNotificationCard.classList.add("mtx-hidden")
    mtxFormContent.classList.add("mtx-hidden")
    mtxFormCloseBtn.classList.add("mtx-hidden")

    SOCKET.on.changeUrl()
    SOCKET.on.changeScroll()
    SOCKET.on.meetingEnded()
    SOCKET.on.changeMode()

    let visitor = {
        userName: meetingVariables.name,
        domain: meetingVariables.domain,
        meetingId: meetingVariables.id,
        token: meetingVariables.token,
        visitorSocketId: meetingVariables.visitorSocketId,
        visitorPosition: {},
        cursorId,
    };

    console.log("visitor join live", visitor)

    socket?.emit("visitorJoinLive", visitor);
    SOCKET.on.connectedUser();
    meetingObj.connect()
}

const checkMeetingVariables = () => {
    // localStorage.clear()
    console.log("meeting variables", getFromStore('MEETING_VARIABLES'))
    // if meeting variables are available it means meeting is not over yet. so establishing it again
    if (getFromStore('MEETING_VARIABLES')) {
        console.log("meeting is establishing again", JSON.parse(getFromStore('MEETING_VARIABLES')))
        meetingStoredVariables = JSON.parse(getFromStore('MEETING_VARIABLES'))
        // mouse.showCursor = getFromStore("MARKETRIX_MODE") 
        meetingVariables.id = meetingStoredVariables.id
        meetingVariables.name = meetingStoredVariables.name
        meetingVariables.participant = meetingStoredVariables.participant
        meetingVariables.token = meetingStoredVariables.token
        meetingVariables.userRole = meetingStoredVariables.userRole
        console.log(meetingVariables.userRole)
        if (meetingVariables.userRole === "admin") {
            decodedObject = JSON.parse(getFromStore("DECODED_OBJECT"))
            adminJoin()
        }
        else {
            // mouse.showCursor = true
            // mouse.cursor.showCursor = true
            socket = io.connect(socketUrl, { query: { appId } });
            visitorJoin()
        }
    }
}

// all watch
const listenting = () => {
    watch(() => {
        checkUrlChanges()
    }, 'currentUrl') // this would be called when ridirecting using router dom
}

// get geo location
// navigator.geolocation.getCurrentPosition((position) => {
//     geoLocation = position.coords
// }, (error) => {
//     console.log(error);
// });

// get ip address
fetch('https://api.ipify.org/?format=json')
    .then(response => response.json())
    .then((data) => {
        ipAddress = data.ip
    });

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
            setCDNLink()
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
            mtxContactFormNotificationCard = document.getElementById("mtx-contact-form-notification-card")
            mtxFormContent = document.getElementById("mtx-form-content")
            mtxFormCloseBtn = document.getElementById("mtx-form-close-btn")
            mtxConnectBtn = document.getElementById("mtx-btn-connect")
            mtxEndCallBtn = document.getElementById("mtx-btn-endcall")
            mtxCursorHeader = document.getElementById("mtx-cursor-header")
            overlay = document.querySelector(".mtx-overlay");
            setCDNLink()

            generateCursorId() // generate cursor id
            checkUrlChanges() // this method would be called when redirecting or reloading
            checkMeetingVariables() // this method would be called when redirection or reloading
            getQuery()
            listenting()
            console.log("app-id", appId);
            console.log("api-key", apiKey);
        });
};

// initializing this snippet in 500 ms
checkReady(() => {
    start();
});

document.addEventListener("keydown", function (event) {
    // Check if the "Escape" key is pressed (esc key has keycode 27)
    if (event.key === "Escape" || event.key === "Esc") {
        // Call the function to close the button (you can replace this with your desired action)
        closeModal();
    }
});

const closeModal = () => {
    marketrixButton.classList.remove("mtx-hidden");
    marketrixModalContainer.classList.add("mtx-hidden");
    overlay.classList.add("mtx-hidden");
};

const showModal = () => {
    marketrixButton.classList.add("mtx-hidden");
    marketrixModalContainer.classList.remove("mtx-hidden");
    // overlay.classList.remove("mtx-hidden");
};

const connectUserToLive = (meetInfo) => {
    console.log("meetInfo", meetInfo);
    socket = io.connect(socketUrl, { query: { appId } });
    console.log("socket", socket)
    if (isUrlChanged) console.log("emit url changes"); SOCKET.emit.urlChange()
    SOCKET.emit.userJoinLive(meetInfo)
    SOCKET.on.connectedUser();
};

const showNotification = () => {
    let notifications = ["We're connecting you!", "Please stay!"]
    let count = 0
    notifications.forEach((notification, index) => {
        count += 1
        if (index === 0) document.getElementById("mtx-contact-notification").innerText = notifications[index]
        setTimeout(() => {
            if (index > 0) document.getElementById("mtx-contact-notification").innerText = notification
        }, 3000 * count)
    })
    
}

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
        windowWidth: window?.innerWidth,
        windowHeight: window?.innerHeight,
        windowResolution: window?.innerWidth + "x" + window?.innerHeight,
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
        ipAddress,
        geoLocation,
        country: 'Sri lanka'
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
        SOCKET.emit.visitorRequestMeet(visitor)
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
        inquiry_status: data.inquiryStatus,
        website_domain: currentUrl,
        app_id: appId,
    };

    console.log("sentInquiryToDb", inquiry);
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