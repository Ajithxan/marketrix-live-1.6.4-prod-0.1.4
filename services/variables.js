console.log("variables.js is established")
const socketUrl = "https://socket-v2.marketrix.io/"; //"https://marketrix-soc.creative-hub.co/"
const serverBaseUrl = "https://api-v2.marketrix.io/";
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