// const puppeteer = require('puppeteer');
//linux设置
const puppeteer = require('puppeteer-core');

const https = require('https')
const schedule = require('node-schedule');

var redis = require("redis");

(async () => {

    const rule = '0/20 * * * * *';
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
        const page = await browser.newPage();
   
        await page.goto('https://twitter.com/elonmusk/with_replies');        
    schedule.scheduleJob(rule, async () => {
        console.log("+++++++++++++刷新页面++++++++++++++++++++++++++++++")
        // const browser = await puppeteer.launch({headless: true});
        //linux设置
        var client = redis.createClient(16379, '0.0.0.0', { auth_pass: '00000' });

        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        const seleter='#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-1gm7m50.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div:nth-child(2) > div > div > div:nth-child(3) > section > div > div > div:nth-child(3) > div > div > article > div > div > div > div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu > div:nth-child(2) > div:nth-child(2) > div'
        
        await page.waitForSelector(seleter);

        

        
        let content0 = await page.$$eval(seleter, element => element.map(data => data.textContent));

        
        content=content0.toString()

        
        await client.get('orderRecord',function(err, reply){
            
        if (err) throw err;
        console.log('历史：'+reply)
        console.log('最新：'+content) 

        if(content != reply
            && (content.toLowerCase().indexOf("doge")!=-1
            ||content.toLowerCase().indexOf("dogecoin")!=-1
            ||content.toLowerCase().indexOf("bitcoin")!=-1
            )){
                console.log('发送-----------'+content  )
                    const data = JSON.stringify({
                        //在https://wxpusher.zjiecode.com/申请
                        "appToken":"AT_00000000000000000000",
                        "content": content+'<br/><a href="https://fanyi.youdao.com/">复制内容翻译</a>',
                        "summary":"马斯克的推特和推文回复！！！",
                        "contentType":2,
                        "topicIds":[
                            2052
                        ],
                        "url":"https://twitter.com/elonmusk/with_replies"
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
             client.set('string orderRecord',content)        
                    
            }else{
                console.log("无需发送")
                
            }
        //   console.log("+++++++++++++关闭页面++++++++++++++++++++++++++++++")
            
            client.quit();
        }); 
        
        
    })

})();
