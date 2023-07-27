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
            console.log("meeting variables", meetingVariables)
            if (meetingVariables.id && meetingVariables.token) meetingObj.connect(); // video sdk screen is starting

            socket?.on("redirectUserToVisitor", (visitorLocation) => {
                console.log("redirecting to visitor", visitorLocation);
            });
        }
    }
};

let currentUrl = window.location.href


const checkUrlChanges = () => {
    if (getFromStore('CURRENT_URL')) {
        if (currentUrl !== getFromStore('CURRENT_URL')) {
            // emit url changes
            console.log("establishing the meeting again")
        }
    }

    setToStore('CURRENT_URL', currentUrl) // set current url in the store
}

const checkMeetingVariables = () => {
    removeFromStore("MEETING_VARIABLES")
    // if meeting variables are available it means meeting is not over yet. so establishing it again
    if (getFromStore('MEETING_VARIABLES')) {
        console.log("meeting is establishing again", JSON.parse(getFromStore('MEETING_VARIABLES')))
        meetingStoredVariables = JSON.parse(getFromStore('MEETING_VARIABLES'))
        meetingVariables.id = meetingStoredVariables.id
        meetingVariables.name = meetingStoredVariables.name
        meetingVariables.participant = meetingStoredVariables.participant
        meetingVariables.token = meetingStoredVariables.token
        meetingVariables.userRole = meetingStoredVariables.userRole
        console.log(meetingVariables.userRole)
        if (meetingVariables.userRole === "admin") return
        mouse.showCursor = true
        mouse.cursor.showCursor = true
        socket = io.connect(socketUrl, { query: { appId } });
        connectedUsers()
        meetingObj.connect()
    }
}

// all watch
const listenting = () => {
    watch(() => {
        checkUrlChanges()
    }, 'currentUrl') // this would be called when ridirecting using router dom
}

// get geo location
navigator.geolocation.getCurrentPosition((position) => {
    geoLocation = position.coords
}, (error) => {
    console.log(error);
});

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
            overlay = document.querySelector(".mtx-overlay");
            setCDNLink()
        });

    getQuery()
    listenting()
    checkUrlChanges() // this method would be called when redirecting or reloading
    checkMeetingVariables() // this method would be called when redirection or reloading
    console.log("app-id", appId);
    console.log("api-key", apiKey);
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
        if (
            meetingVariables.userRole === "visitor" &&
            meetingId === data[index].meetingId
        ) {
            if (data[index].cursor.showCursor) mouse.show();
            else mouse.hide();
        }
    });
};

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
        socket.emit("VisitorRequestMeet", visitor, (response) => {
            console.log("visitorRequestMeet", response); // ok

            if (!response.status) {
                alert(response.message + " ___ We will contact you soon through email");
                sentInquiryToDb(visitor);
            } else {
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
                    if (data) meetingObj.connect();
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