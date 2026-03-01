const http = require('http');

const PORT = 3001;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 开始API测试...\n');

  try {
    // 测试健康检查
    console.log('1. 测试 /health 端点:');
    const healthResponse = await makeRequest('/health');
    console.log(`   状态码: ${healthResponse.statusCode}`);
    console.log(`   响应: ${healthResponse.body}\n`);

    // 测试info端点
    console.log('2. 测试 /info 端点:');
    const infoResponse = await makeRequest('/info');
    console.log(`   状态码: ${infoResponse.statusCode}`);
    console.log(`   响应: ${infoResponse.body}\n`);

    // 测试factors端点
    console.log('3. 测试 /factors 端点:');
    const factorsResponse = await makeRequest('/factors');
    console.log(`   状态码: ${factorsResponse.statusCode}`);
    console.log(`   响应长度: ${factorsResponse.body.length} 字符\n`);

    // 测试注册
    console.log('4. 测试用户注册:');
    const registerData = {
      username: 'testuser',
      password: 'testpassword123'
    };
    const registerResponse = await makeRequest('/register', 'POST', registerData);
    console.log(`   状态码: ${registerResponse.statusCode}`);
    console.log(`   响应: ${registerResponse.body}\n`);

    // 如果注册成功，测试登录
    if (registerResponse.statusCode === 200) {
      console.log('5. 测试用户登录:');
      const loginData = {
        username: 'testuser',
        password: 'testpassword123'
      };
      const loginResponse = await makeRequest('/login', 'POST', loginData);
      console.log(`   状态码: ${loginResponse.statusCode}`);
      console.log(`   响应: ${loginResponse.body}\n`);

      // 解析token用于后续测试
      const loginResult = JSON.parse(loginResponse.body);
      if (loginResult.token) {
        console.log('6. 测试需要认证的端点:');
        const ledgerResponse = await makeRequest('/ledger', 'POST', {
          user_id: '1',
          type: 'transport',
          amount: 100,
          unit: 'km',
          meta: { gco2PerKm: 120 }
        });
        console.log(`   状态码: ${ledgerResponse.statusCode}`);
        console.log(`   响应: ${ledgerResponse.body}\n`);
      }
    }

    console.log('✅ API测试完成！');
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

// 运行测试
runTests();