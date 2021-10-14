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

class Promise {
    status: STATUS
    value: any
    reason: any
    onResolveCallbacks: Function[]
    onRejectedCallbacks: Function[]
    constructor(executor) {
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
    then(onFulfilled, onRejected) {
        // 每次调用then都产生一个全新的promise
        return new Promise((resolve, reject) => {
            if (this.status == STATUS.fulfilled) {
                try {
                    resolve(onFulfilled(this.value)) // 用then的返回值 最为下次then的成功结果
                } catch (e) {
                    reject(e)
                }
            }
            if (this.status == STATUS.rejected) {
                try {
                    resolve(onRejected(this.reason)) // 用then的返回值 最为下次then的成功结果
                } catch (e) {
                    reject(e)
                }
            }
            if (this.status == STATUS.pending) {
                // 订阅
                this.onResolveCallbacks.push(() => {  // 切片
                    // 可以增加额外逻辑
                    try {
                        resolve(onFulfilled(this.value)) // 用then的返回值 最为下次then的成功结果
                    } catch (e) {
                        reject(e)
                    }
                })
                this.onRejectedCallbacks.push(() => {
                    // 可以增加额外逻辑
                    try {
                        resolve(onRejected(this.reason)) // 用then的返回值 最为下次then的成功结果
                    } catch (e) {
                        reject(e)
                    }
                })
            }
        })
    }


}

export default Promise
