console.log("env.js is established")
const API_URL = "https://server.marketrix.co"; // "https://api.marketrix.io/";

const END_POINTS = {
    MEETING: {
        TEST: "/posts",
        CLIENT_JOIN: 'videoSDK/video_sdk/client_join_meeting',
        USER_JOIN: 'videoSDK/video_sdk/user_join_meeting',
        TOKEN_JOIN: 'videoSDK/video_sdk/token_join_meeting',
        GUEST_JOIN: 'videoSDK/video_sdk/guest_join_meeting',
        ADMIN_JOIN: 'videoSDK/video_sdk/admin_join_meeting',
        //    END_MEETING: 'videoSDK/video_sdk/end_meeting',
        MEETING_CREATE: 'admin/meeting/create_meeting',
        UPDATE_PITCH: 'admin/meeting/update/',
        UPDATE_CLIENTS: 'admin/meeting/update_clients/',
        GET_ALL: 'admin/meeting/all',
        START_MEETING: 'videoSDK/video_sdk/create_meeting',
        END_MEETING: 'admin/meeting/end_meeting/',
        RESEND_EMAIL: 'admin/email/resend_email/',
        RESEND_EMAIL_V2: 'admin/email/resend_email_v2',
        DELETE_MEETING: 'admin/meeting/delete/'
    }
}

const VIDEO_SDK = {
    API_KEY: "9eaac847-396b-4c07-9fd6-3550b012ed71",
    SECRET_KEY: "83a20d851ad718ab093b64da820baab4af0587846467e76abee24ef4a6d506c7",
    API_ENDPOINT: "https://api.videosdk.live"
}

const USER_TOKEN_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inp4Y0BnbWFpbC5jb20iLCJpYXQiOjE2NjkwMTI0NTd9.qUUrwL-Of_x3FzI0SYpRFBRS6ityOmJ_t6D8e3TJisw"