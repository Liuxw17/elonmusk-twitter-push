const puppeteer = require('puppeteer');
//linux设置
//const puppeteer = require('puppeteer-core');

const https = require('https')
const schedule = require('node-schedule');

var redis = require("redis");

(async () => {
    const rule = '0/60 * * * * *';
     console.log("------------初始化浏览器-----------------------")
    const browser = await puppeteer.launch({ 
            executablePath: '/usr/bin/chromium', 
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
    schedule.scheduleJob(rule, async () => {
        console.log("+++++++++++++打开页面++++++++++++++++++++++++++++++")
        // const browser = await puppeteer.launch({headless: true});
        //linux设置
        var client = redis.createClient(16379, '0.0.0.0', { auth_pass: '00000' });
        const page = await browser.newPage();
        await page.goto('https://twitter.com/elonmusk');
        await page.waitForSelector('article');
        let tweetsArray = await page.$$('div[data-testid="tweet"]');

        let tweetElement0 = tweetsArray[0]

        let content0 = await tweetElement0.$$eval('div+div>div>div>span', element => element.map(data => data.innerText));
        content=content0.toString()
         await client.get('orderRecord',function(err, reply){
            
        console.log('临时：'+reply)
        if (err) throw err;
        console.log('最新：'+content)               
            if(content != reply.toString() && (content.toLowerCase().indexOf("doge")!=-1||content.toLowerCase().indexOf("dogecoin")!=-1)){
                console.log('发送-----------'+content  )
                    const data = JSON.stringify({
                        //在https://wxpusher.zjiecode.com/申请
                        "appToken":"",
                        "content": content,
                        "summary":"马斯克在推特中提到狗狗币了！！！",
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
           console.log("+++++++++++++关闭页面++++++++++++++++++++++++++++++")
            page.close();
            client.quit();
        }); 
    })

})();
