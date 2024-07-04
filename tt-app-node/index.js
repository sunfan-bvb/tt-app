const express = require("express");
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { parse } = require('url');
const app = express();

const app_token = "TTP_RwH9lwAAAAAFKKw_Sq-O8GU4PFQAihuPIza_lAAcaB7XT8yiX_StNpYUWbUqjOL5Lxfl8lymArwJleZjWurz4euRdwUgA0ld3OP9mfBQqGKpXhCS4BStzPr-CX3nBJ3hUEc2wv-aIuvajQK_C-tOYtHTWp61IysGXLx1W74BFUXMq54YiyrAQg";

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['x-tts-access-token'] = app_token;
axios.defaults.baseURL = 'https://open-api.tiktokglobalshop.com';
const baseParamsWOCipher = 'access_token=' + app_token +'&app_key=6ca7snomotd4q&shop_id=7495756357774051569';
const baseParams = 'access_token=' + app_token +'&app_key=6ca7snomotd4q&shop_cipher=TTP_b4ccGAAAAABa9sJkcygyRkx-CiKUqVyx&shop_id=7495756357774051569';

app.use(cors());

function CalSign(req, secret) {
  const { query, pathname } = parse(req.url, true);

  const keys = Object.keys(query).filter(key => key !== 'sign' && key !== 'access_token');
  keys.sort();

  let input = keys.map(key => key + query[key]).join('');

  input = pathname + input;
  const contentType = req.headers['content-type'];
  if (!/^multipart\/form-data/.test(contentType)) {
    const bodyChunks = [];
    req.on('data', chunk => bodyChunks.push(chunk));
    return new Promise((resolve, reject) => {
      req.on('end', () => {
        const body = Buffer.concat(bodyChunks).toString('utf8');
        input += body;
        resolve(generateSHA256(input, secret));
      });
      req.on('error', reject);
    });
  } else {
    return generateSHA256(input, secret);
  }
}

function generateSHA256(input, secret) {
  input = secret + input + secret;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(input);
  return hmac.digest('hex');
}

app.get("/products", (req, res) => {

  const timestamp = Math.floor(Date.now() / 1000);
  req.url = '/api/products/search?' + baseParams + '&timestamp=' + String(timestamp) + '&version=202212';
  req.body = {"page_number":1,"page_size":10}
  CalSign(req, '9918508cab14f3a0059762de7e7ca9c75056e85f')
      .then(signature => {
        const url = '/api/products/search?' + baseParams + '&sign=' + signature + '&timestamp=' + String(timestamp) + '&version=202212';
        axios.post(url, {"page_number":1,"page_size":10}).then(r => {
          res.send(r.data);
        })
      })
      .catch(error => {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
});

app.get("/product", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const productId = req?.query?.id;
  req.url = '/product/202309/products/' + productId + '?' + baseParams + '&timestamp=' + String(timestamp) + '&version=202309';
  CalSign(req, '9918508cab14f3a0059762de7e7ca9c75056e85f')
      .then(signature => {
        const url = '/product/202309/products/' + productId + '?' + baseParams + '&sign=' + signature + '&timestamp=' + String(timestamp) + '&version=202309';
        axios.get(url).then(r => {
          res.send(r.data);
        })
      })
      .catch(error => {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
})

app.get("/orders", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  req.url = '/order/202309/orders/search?' + baseParams + '&page_size=10&timestamp=' + String(timestamp) + '&version=202309';
  CalSign(req, '9918508cab14f3a0059762de7e7ca9c75056e85f')
      .then(signature => {
        const url = '/order/202309/orders/search?' + baseParams + '&page_size=10&sign=' + signature + '&timestamp=' + String(timestamp) + '&version=202309';
        axios.post(url).then(r => {
          res.send(r.data);
        })
      })
      .catch(error => {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
})

app.get("/order", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const orderId = req?.query?.id;
  req.url = '/order/202309/orders?' + baseParams + '&ids=' + orderId + '&timestamp=' + String(timestamp) + '&version=202309';
  CalSign(req, '9918508cab14f3a0059762de7e7ca9c75056e85f')
      .then(signature => {
        const url = '/order/202309/orders?' + baseParams + '&ids=' + orderId + '&sign=' + signature + '&timestamp=' + String(timestamp) + '&version=202309';
        axios.get(url).then(r => {
          res.send(r.data);
        })
      })
      .catch(error => {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
})

app.get("/categories", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  req.url = '/product/202309/global_categories?' + baseParamsWOCipher + '&timestamp=' + String(timestamp) + '&version=202309';
  CalSign(req, '9918508cab14f3a0059762de7e7ca9c75056e85f')
  .then(signature => {
    const url = '/product/202309/global_categories?' + baseParamsWOCipher + '&sign=' + signature + '&timestamp=' + String(timestamp) + '&version=202309';
    axios.get(url).then(r => {
      res.send(r.data);
    })
  })
  .catch(error => {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
})

app.get("/brands", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  req.url = '/api/products/brands?' + baseParams + '&timestamp=' + String(timestamp) + '&version=202212';
  CalSign(req, '9918508cab14f3a0059762de7e7ca9c75056e85f')
  .then(signature => {
    const url = '/api/products/brands?' + baseParams + '&sign=' + signature + '&timestamp=' + String(timestamp) + '&version=202212';
    axios.get(url).then(r => {
      res.send(r.data);
    })
  })
  .catch(error => {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
})

app.get("/attributes", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const categroy_id = req?.query?.id;
  req.url = '/product/202309/categories/' + String(categroy_id) + "/attributes?" + baseParams + '&timestamp=' + String(timestamp) + '&version=202309';
  CalSign(req, '9918508cab14f3a0059762de7e7ca9c75056e85f')
  .then(signature => {
    const url = '/product/202309/categories/' + String(categroy_id) + "/attributes?" + baseParams + '&sign=' + signature + '&timestamp=' + String(timestamp) + '&version=202309';
    axios.get(url).then(r => {
      res.send(r.data);
    })
  })
  .catch(error => {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
})

app.get("/widgettoken", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  req.url = '/authorization/202401/widget_token?' + baseParamsWOCipher + '&timestamp=' + String(timestamp) + '&version=202401';
  CalSign(req, '9918508cab14f3a0059762de7e7ca9c75056e85f')
  .then(signature => {
    const url = '/authorization/202401/widget_token?' + baseParamsWOCipher + '&sign=' + signature + '&timestamp=' + String(timestamp) + '&version=202401';
    axios.get(url).then(r => {
      res.send(r.data);
    })
  })
  .catch(error => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
})

app.listen(8000, () => {
  console.log("示例程序正在监听 8000 端口！");
});