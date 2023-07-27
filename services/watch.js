console.log("watch.js is established")
const watch = (callBack, variable) => {
    let old;

    setInterval(() => {
        if (Array.isArray(variable)) {
            const obj = {}
            variable.forEach(v => {
                obj[v] = eval(v)
            })
            compareObj(obj, old, callBack)
            old = obj
        } else if (old !== eval(variable)) {
            callBack()
            old = eval(variable)
        }
    }, 1)
}

const compareObj = (newObj, oldObj, callBack) => {
    if (oldObj)
        Object.keys(newObj).forEach(key => {
            if (newObj[key] !== oldObj[key]) {
                callBack()
            }
        })
}