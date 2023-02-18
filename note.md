## Promise


### 改变promise状态和指定回调函数谁先谁后

- 都有可能，正常情况下是先指定回调再改变状态，但也可以先改状态再指定回调
- 如何先改状态再指定回调
    - 在执行器中直接调用resolve/reject
    - 延迟更长时间才调用then
- 什么时候才能得到数据
    - 如果先指定的回调，当状态反生改变时，回调函数就会调用，得到数据
    - 如果嫌改变的状态，当指定回调时，回调就会调用，得到数据

### promise.then()返回新的promise的结果状态由什么决定

- 如果抛出异常，新promise变为rejected，reason为抛出的异常
- 如果返回的是非promise的任意值，新promise变为fulfilled，value为返回的值
- 如果返回的是一个新的promise，，此promise的结果就会成为新promise的结果