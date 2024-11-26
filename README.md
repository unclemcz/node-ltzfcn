# node-ltzfcn
蓝兔支付（微信）的nodejs封装，关于蓝兔支付的更多信息，请访问：https://www.ltzf.cn

## 说明
本项目包含两个你用得到的代码文件：config.js和pay.js，其中config.js是配置文件（把config.js.txt改为config.js），需要你在这里配置ltzf的商户码和授权码，以及支付和付款的回调地址，pay.js是功能代码文件；由于仅封装了ltzf接口的调用、签名生成、异步签名校验等功能，每个接口返回的是一个JSON格式数据，需要你结合业务代码自行处理，所有接口返回的数据格式属性，请直接参考[ltzf](https://www.ltzf.cn/doc)的官方文档，这里不再解释。

## 要求
支持nodejs8以上版本，需要依赖superagent。
## 使用说明

### 支付
#### 初始化
修改配置文件config.js：
```
let ltzfkey = ''; //蓝兔支付的商户密钥
let ltzfmchid = ''; //蓝兔支付的商户号

let ltzf_native_notify_url= 'https://notify'; //支付成功后回调的地址
let ltzf_refund_notify_url= 'https://notify';  //退款成功后回调的地址

```
将两文件引入自己的业务代码：
```
const cfg = require("./config.js"); 
const pay = require("./pay.js");
```
#### 微信扫码支付
构建入参：
```
let params = {
  "mch_id": cfg.ltzfmchid,     //商户号
  'out_trade_no': '123456789-5', //用户端自主生成的订单号
  'total_fee': '200',              //金额。单位：元
  'body': '塞尔达传说旷野之息',           //订单标题
  'timestamp': Date.now().toString().substring(0,10) ,
  'notify_url': cfg.ltzf_native_notify_url, //接收微信支付异步通知的回调地址，不可留空
};
```
调用：

```
pay.native(params,function (msg) {
    //console.log(params);
    console.log(msg);
    //TODO 这里处理业务逻辑 
});
```

#### 微信订单退款
构建入参：
```
let params = {
  "mch_id": cfg.ltzfmchid,
  'out_trade_no': '123456789-5',     //商户订单号
  'out_refund_no': 'LTZFrefund'+Date.now().toString(),    //商户退款订单号
  'timestamp': Date.now().toString().substring(0,10),
  'refund_fee': 20
};
```
调用：

```
pay.refund(params,function (msg) {
  console.log(msg);
  //TODO 这里处理业务逻辑
});
```

### 回调
回调时如果没有设置百名单，从安全上考虑，需要验证签名。建议不管有没有设置百名单，都要验证签名。

#### 支付回调
```
router.post('/notify', function(req, res, next) {
  let params=req.body;
  let params_for_check = {...params};
  if(ltzfpay.notifyCheck(params_for_check,['pay_channel','trade_type','success_time','attach','openid'])==true){ //签名校验成功
    if(params.code==0){
      res.send('SUCCESS');
    }else{
      res.send('FAIL');
    }
  }else{
    //校验失败
    res.send('FAIL');
  }
});
```
#### 退款回调
```
router.post('/notify', function(req, res, next) {
  let params=req.body;
  let params_for_check = {...params};
  if(ltzfpay.notifyCheck(params_for_check,['success_time'])==true){ //签名校验成功
    if(params.code==0){
      res.send('SUCCESS');
    }else{
      res.send('FAIL');
    }
  }else{
    //校验失败
    res.send('FAIL');
  }
});
```
