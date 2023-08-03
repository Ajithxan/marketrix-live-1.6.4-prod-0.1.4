console.log("store.js is established")
// ---keys---
// CURRENT_URL
// MEETING_VARIABLES
// DECODED_OBJECT
// SOCKET_IO
// CURSOR_ID

const setToStore = (key, value) => {
    localStorage.setItem(key, value)
}

const getFromStore = (key) => {
    return localStorage.getItem(key)
}

const removeFromStore = (key) => {
    localStorage.removeItem(key)
}