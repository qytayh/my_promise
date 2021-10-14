// 1.每个promise都有三个状态   pending 等待态   resolve 标识变成成功态fulfilled    reject 标识变成失败态 REJECTED
// 2.每个promise需要有一个then方法，传入两个参数，一个是成功的回调  另一个是失败的回调
// 3.new promise 会立即执行
// 4.当promise抛出异常后 也会走失败态
// 5.状态不可逆 一旦成功就不能失败 一旦失败就不能成功

const enum STATUS { // 存放所需要的状态
    pending = 'PENDING',
    fulfilled = 'FULFILLED',
    rejected = 'REJECTED'
}

// 核心逻辑 解析x的类型  决定promise2 走成功还是失败
function resolvePromise(promise2, x, resolve, reject) {
    // 判断x的值 决定promise2的关系   判断有可能x是别的第三方promise的x 可能第三方promise会出问题
    if (x == promise2) {
        return reject(new TypeError('type error'))
    }
    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        // 只有x是对象或函数 才可能是promise
        let called = false // 表示没调用过成功/失败
        try {
            const then = x.then // 取x上的then
            if (typeof then === "function") {
                then.call(x, y => {
                    if (called) return
                    called = true
                    // y可能也是一个promise  递归解析 直到y是普通值
                    resolvePromise(promise2, y, resolve, reject)
                }, r => {
                    if (called) return
                    called = true
                    reject(r)
                })
            }else{
                resolve(x) // 普通对象
            }
        } catch (error) {
            if (called) return
            called = true
            reject(error) // 取then失败
        }
    } else {
        // 如果不是 那一定是一个普通值
        resolve(x)
    }

}

class MyPromise {
    static deferred
    status: STATUS
    value: any
    reason: any
    onResolveCallbacks: Function[]
    onRejectedCallbacks: Function[]
    constructor(executor: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void) {
        this.status = STATUS.pending // 当前默认状态
        this.value = undefined // 成功原因
        this.reason = undefined // 失败原因
        this.onResolveCallbacks = []
        this.onRejectedCallbacks = []
        const resolve = (value?: any) => {
            if (this.status === STATUS.pending) {
                this.status = STATUS.fulfilled
                this.value = value
                // 发布订阅模式
                this.onResolveCallbacks.forEach(fn => fn())
            }
        }
        const reject = (reason?: any) => {
            if (this.status === STATUS.pending) {
                this.status = STATUS.rejected
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }
        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }
    then(onFulfilled?, onRejected?) {
        onFulfilled = typeof onFulfilled == "function" ? onFulfilled : val => val
        onRejected = typeof onRejected == "function" ? onRejected : err => {throw err}
        // 每次调用then都产生一个全新的promise
        const promise2 = new MyPromise((resolve, reject) => {
            if (this.status == STATUS.fulfilled) {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value) // 用then的返回值 最为下次then的成功结果
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0);

            }
            if (this.status == STATUS.rejected) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason)// 用then的返回值 最为下次then的成功结果
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0);
            }
            if (this.status == STATUS.pending) {
                // 订阅
                this.onResolveCallbacks.push(() => {  // 切片
                    // 可以增加额外逻辑
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    }, 0);
                })
                this.onRejectedCallbacks.push(() => {
                    // 可以增加额外逻辑
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    }, 0);

                })
            }
        })
        return promise2
    }
}

MyPromise.deferred = function () {
    let dfd = {} as any
    dfd.promise = new MyPromise((resolve, reject) => {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}

export default MyPromise
