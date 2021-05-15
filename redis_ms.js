const puppeteer = require('puppeteer');
//linux设置
//const puppeteer = require('puppeteer-core');

const https = require('https')


var redis = require("redis");
var client = redis.createClient(*, '*.*.*.*', { auth_pass: '*' });









(async () => {
     console.log("------------初始化浏览器-----------------------")
    const browser = await puppeteer.launch({ 
            //executablePath: '/usr/bin/chromium', 
            headless:true,
            args:["--no-sandbox",
                '–disable-dev-shm-usage',
                '–disable-setuid-sandbox',
                '–no-first-run',
                '–no-zygote',
                '–single-process',
                '–disable-gpu',
                '–disable-dev-shm-usage'
        
        ] });    
    
        console.log("+++++++++++++打开页面++++++++++++++++++++++++++++++")
        // const browser = await puppeteer.launch({headless: true});
        //linux设置
        
        const page = await browser.newPage();
        await page.goto('https://twitter.com/elonmusk');
        await page.waitForSelector('article');
        let tweetsArray = await page.$$('div[data-testid="tweet"]');
        let tweetElement = tweetsArray[1]

        let content = await tweetElement.$$eval('div+div>div>div>span', element => element.map(data => data.innerText));
        content=content.toString()
        
        
        
        
        
         await client.get('orderRecord',function(err, reply){
            
        console.log('临时：'+reply)
        console.log('最新：'+content)               
            if(content != reply.toString()){
                console.log('发送-----------')
                    const data = JSON.stringify({
                        //在https://wxpusher.zjiecode.com/申请
                        "appToken":"AT_*",
                        "content": content,
                        "summary":"马斯克的推特",
                        "contentType":1,
                        "topicIds":[
                            2052
                        ],
                        "url":"https://v.gojw.xyz"
                    })
                    const options = {
                        hostname: 'wxpusher.zjiecode.com',
                        path:'/api/send/message',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }

                    const req = https.request(options, res => {
                        console.log(`状态码: ${res.statusCode}`)

                        res.on('data', d => {
                            process.stdout.write(d)
                        })
                    })
                    req.on('error', error => {
                        console.error(error)
                    })
                    req.write(data)
                    req.end()  
             client.set('orderRecord',content)        
                
            }else{
                console.log("无需发送")
                
            }
             console.log("+++++++++++++关闭浏览器++++++++++++++++++++++++++++++")
             browser.close();
             client.quit();
        }); 
 

        


})();

