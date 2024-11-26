const crypto = require('crypto');
const cfg = require('./config.js');
const request = require('superagent');

const urlnative   = 'https://api.ltzf.cn/api/wxpay/native';
const urlrefund   = 'https://api.ltzf.cn/api/wxpay/refund_order';



const key = cfg.ltzfkey;

function wxPaySign(params, key) {
    const paramsArr = Object.keys(params);
    paramsArr.sort();
    const stringArr = [];
    paramsArr.map(key => {
        stringArr.push(key + '=' + params[key]);
    });
    // 最后加上商户Key
    stringArr.push("key=" + key);
    const string = stringArr.join('&');
    return md5(string).toString().toUpperCase();
}

function md5(str) {
    var encoding = arguments[1] !== (void 0) ? arguments[1] : 'utf8';
    return crypto.createHash('md5').update(str, encoding).digest('hex');
};
  
  
//签名
//  ignorekey:['key']  不参与签名的参数
function signature(paramss,ignorekey=[]) {
    let params = {...paramss};
    for (p in ignorekey){
        delete paramss[ignorekey[p]];
    }
    //console.log(paramss);
    params['sign'] = wxPaySign(paramss,key);
    //console.log(params);
    return params;
}



//扫码支付（主扫）
function native(params, callback) {
    request.post(urlnative)
        .send(signature(params,['attach','time_expire','developer_appid']))
        .set("content-type","application/x-www-form-urlencoded")
        .end(function (err, res) {
            if (!err) {
                callback(res.body);
            } else {
                console.log(err);
                callback({ 'return_code': 0, 'msg': '本地调用出错' });
            }
        });
}


//退款接口
function refund(params, callback) {
    request.post(urlrefund)
        .send(signature(params,['refund_desc','notify_url']))
        .set("content-type","application/x-www-form-urlencoded")
        .end(function (err, res) {
            if (!err) {
                callback(res.body);
            } else {
                console.log(err);
                callback({ 'return_code': 0, 'msg': '本地调用出错' });
            }
        });
}

//异步通知的签名校验
function notifyCheck(params,ignorekey=[]) {
    let originSign = params["sign"];
    delete params["sign"];
    return signature(params,ignorekey)["sign"] == originSign;
}


exports.native=native;//扫码支付
exports.refund=refund;//退款接口
exports.notifyCheck=notifyCheck;//异步通知的数据校验


