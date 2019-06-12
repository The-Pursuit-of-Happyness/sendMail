const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const nodemailer = require("nodemailer"); //发送邮件的node插件
const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置
const schedule = require("node-schedule"); //定时器任务库
//配置项

//纪念日
let startDay = "2017/8/5";
//当地拼音,需要在下面的墨迹天气url确认
const local = "beijing/chaoyang-district";
//发送者邮箱厂家
let EmianService = "163";
//发送者邮箱账户SMTP授权码
let EamilAuth = {
  user: "15898195729@163.com",
  pass: "xwq102558"
};
//发送者昵称与邮箱地址
let EmailFrom = '"夏文齐" <15898195729@163.com>';

//接收者邮箱地
// let EmailTo = "1779144665@qq.com";
let EmailTo = "1025582613@qq.com";
//邮件主题
let EmailSubject = "一封暖暖的小邮件";

//每日发送时间
let EmailHour = 15;
let EmialMinminute = 52;

// 爬取数据的url
const OneUrl = "http://wufazhuce.com/";
const WeatherUrl = "https://tianqi.moji.com/weather/china/" + local;

const praiseStatement = ["你若安好便是晴天，祝你开心每一天！",
  "没有人可以做你的双拐，你必须学会独立去闯荡",
  "不想做颓废落寞的人，所以，精致的生活，所以，快乐的工作",
  "岁月还漫长，你心地善良，终会有一人陪你骑马喝酒走四方",
  "自己的世界不大不小，温暖自己却刚刚好。",
  "你站在桥上看风景，看风景的人在楼上看你。",
  "你可知我岁月冷暖，若知，我愿为你倾尽天下。若不知，请你为我鼓瑟吹笙，互诉良音。",
  "每想你一次，天上飘落一粒沙，从此形成了撒哈拉。 每想你一次，天上就掉下一滴水，于是形成了太平洋。",
  "愿有岁月可回首，且以深情共白头。",
  "我一直在你身后， 需要我的时候回个头就好了。",
  "你站的方向吹过来的风是暖的",
  "成长的悲哀或许就在于，人们再也莫要机会去表现纯真和幼稚。",
  "人的一生会遇到两个人，一个惊艳了时光，一个温柔了岁月。",
  "我清楚不能活在回忆里。我清楚不能死在未来里。",
  "其实，世界上最浪漫的事，并不是什么烛光晚餐，而是，我喜欢你，恰巧，你也来到了我身边……",
  "冬天到了，风吹的很冷，气变得很沉，想你的心依旧很真。",
  "奇迹就留给别人吧，我有你了",
  "我宁愿他欠我的，也不愿他欠别人的。",
  "最温暖人心的莫过于陪伴。",
  "我愿化为清风瞥见蹙眉便付拥抱",
  "有你的陪伴我不再孤单，有你的温暖我不再悲凉。",
  "你若一笑，春暖花开。",
  "我要的东西，我自己会努力，当然，以后会多一个你。",
  "有你在，冬天都没那么冷了。",
  "有一个故事，想说给你听. 有一首歌，想与你分享. 有一种心情，想让你知道，也许你从未察觉，我喜欢你.",
  "我也希望有人会觉得认识我是很幸运的事.",
  "人生，没有过不去的坎",
  "成功不在难易，而在于是否采取行动",
  "人只有将寂寞坐断，才可以重拾喧闹;把悲伤过尽，才可以重见欢颜",
  "我们都有一片属于自己的荒漠，我们既是金子，亦是淘金者",
  "人总会遇到挫折，总会有低潮，会有不被人理解的时候",
  "不管多远的路，都能走到尽头;不论多深的痛苦，也会有结束的一天",
  "人生，没有永远的伤痛，再深的痛，在切之时，伤口总会痊愈",
  "一个人，想要优秀，你必须要接受挑战",
  "你不能决定生命的长短，但你可以控制它的质量",
  "人生，由我不由天，幸福，由心不由境",
  "如果你觉得不爽，你就抬眼望窗外，世界很大，风景很美，机会很多",
  "没有清醒的头脑，再快的脚步也会走歪;没有谨慎的步伐，再平的道路也会跌倒。",
  "运气不可能持续一辈子，能帮助你持续一辈子的东西只有你个人的能力。",
  "空想会想出很多绝妙的主意，但却办不成任何事情。",
  "做强者，战自卑;攀高峰，胜逆境;增才干，永学习;报效祖国为人民。",
  "运气不可能持续一辈子，能帮助你持续一辈子的东西只有你个人的能力。",
  "面对艰难困苦，懦弱者被磨去棱角;勇敢者将意志品质磨砺得更为坚强。",
  "哪怕是最没有希望的事情，只要有一个勇敢者去坚持做，到最后就会拥有希望。",
  "人生，要的就是惊涛骇浪，这波涛中的每一朵浪花都是伟大的，最后汇成闪着金光的海洋。",
  "一个有信念者所开发出的力量，大于个只有兴趣者。",
  "一遇挫折就灰心丧气的人，永远是个失败者。而一向努力奋斗，坚韧不拔的人会走向成功。",
  "生命之灯因热情而点燃，生命之舟因拼搏而前行。",
  "有志者，事竟成，破釜沉舟，百二秦关终属楚;苦心人，天不负，卧薪尝胆，三千越甲可吞吴。永不满足是我向上的动力。",
  "机会，需要我们去寻找。让我们鼓起勇气，运用智慧，把握我们生命的每一分钟，创造出一个更加精彩的人生。",
  "拥有梦想只是一种智力，实现梦想才是一种能力。",
  "忍别人所不能忍的痛，吃别人所别人所不能吃的苦，是为了收获得不到的收获。",
  "行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧。",
  "短暂的一生会有许多坎坷和波折，我把它视为前进的阶梯，去获得“学问之趣味”。",
  "自己打败自己是最可悲的失败，自己战胜自己是最可贵的胜利。",
  "在我的生命中，从未遭受过失败，我所遇到的，都是暂时的挫折罢了。",
  "只有知道如何停止的人才知道如何加快速度。",
  "最强的人并不一定都是成功的人，却一定是在他们失去之时不放弃的人。",
  "你可以忘掉苦难，但不能忘却艰辛;你可以忘掉伤疤，但不能忘却耻辱。",
  "人生的奋斗目标不要太大，认准了一件事情，投入兴趣与热情坚持去做，你就会成功。",
  "不想做颓废落寞的人，所以，精致的生活，所以，快乐的工作",
  "没有人可以做你的双拐，你必须学会独立去闯荡",
  "生命不轻言放弃，漫长的人生中，谁也不可能一帆风顺",
  "一切都是态度决定的：当心你的思想，它们会成为你的语言",
  "有些事情是急不来的，等到条件成熟时，自然水到渠成",
  "人生不可能一帆风顺，有成功，也有失败;有开心，也有失落",
  "有人说，人生有两杯必喝之水，一杯是苦水，一杯是甜水",
  "如果真心只会换来心碎，宁愿换一季落花，就算凋零也要芳香远扬",
  "活得优雅些!也许你的生活并不富裕;也许你的工作不够好",
  "人生无常，再明媚的春天，偶尔也会有云翳遮住阳光",
  "人生是需要用苦难浸泡的，没有了伤痛，生命就少了炫彩和厚重",
  "上天对每人都是公平的，它在关上一扇门的同时，必定会打开一扇窗",
  "跟着理智走，要有勇气;跟着感觉走，就要有倾其所有的决心",
  "没有欢笑的时光，是虚度的光阴",
  "不经历风雨，怎么见彩虹?没有人能马马虎虎成功",
  "每一次的考验，都有一份收获;每一次的泪水，都有一次醒悟",
  "大多的时候，都是生活选择你，而不是你去选择生活",
  "所谓的成长，就是越来越能接受自己本来的样子",
  "我是一片云，偶尔投影你波心。",
  "与你牵手的手指，夜里，独自合十。",
  "一切情，不在言语，在心上。",
  "风和日暖，令人愿意永远活下去。",
  "我愿意舍弃一切，以想念你终此一生。",
  "你笑起来真像好天气。",
  "我今天才知道，我之所以漂泊就是在向你靠近。",
  "不管前方的路有多苦，只要走的方向正确，不管多么崎岖不平，都比站在原地更接近幸福。",
  "别怕，有我在",
  "你在我身边也好，在天边也罢，想到世界的角落有一个你，觉得整个世界也变得温柔安定了",
  "给每一个烦恼一段期限，在有限的时间内尽力解决，剩下的时间，请还给快乐的自己。",
  ".去见你想见的人，去做你想做的事，趁阳光正好，趁微风不噪，趁你未老。",
  "时间会告诉我们，简单的喜欢，最长远；平凡中的陪伴，最心安；懂你的人，最温暖。",
  "心若被困，世间处处都是牢笼；心若安泰，哪里都是天堂。",
  "人生苦短，不要计较太多，与其在纷扰中度日如年，不如在舒适中快乐生活。",
  "让你迷茫的原因只有一个，想的太多做的太少，别忘了，只有行动才能造就一个人。",
  "不要期待，不要假想，不要强求，顺其自然，如果注定，便一定会发生。心安，便是活着的最美好状态。",
  "无人理睬时，坚定执着。万人羡慕时，心如止水。",
  "没什么好抱怨的，今天的选择都是明天的伏笔。",
  "为了自己想要的未来，无论现在有多难熬，都必须得满怀信心的坚持下去。",
  "不属于你的圈子不要硬挤，头破血流也没意义。等你足够强大，相应的圈子会主动来吸纳你。",
  "选一种姿态，让自己活得无可替代。",
  "你若不离不弃，我必生死相依。深情是你，情深也是你。",
  "你陪着我的时候，我从没羡慕过任何人。",
  "遇到你，是我一生的缘分；牵着你，是我一生的快乐；爱上你，是我一生的幸运。今生有你相伴，是我一生的幸福。",
  "最温柔的月光，也敌不过，你转瞬的回眸。",
  "我喜欢你，不光是因为你的样子，还因为和你在一起时我的样子。",
  "不要着急，最好的总会在最不经意的时候出现。",
  "不要因为结束而哭泣，微笑吧，为你的曾经拥有。",
  "我总是躲在梦与季节的深处，听花与黑夜唱尽梦魇，唱尽繁华，唱断所有记忆的来路。",
  "黑夜给了我黑色的眼睛，我却用它寻找光明。",
  "岁月静好，只想数着你的心跳，慢慢地陪着你变老。",
  "不要想太多，不要熬夜，要经常笑。",
  "难熬的日子总会过去，不信你回头看看，你都已经在不知不觉中，熬过了很多苦难，很棒吧。",
  "身安，不如心安；屋宽，不如心宽。所谓快乐，不是你财富多，而是欲望少。",
  "每个人的性格中，都有某些无法让别人接受的部分，再优秀的人也一样；所以，不要苛求别人，也不要埋怨自己。",
  "慢慢变好，才是给自己最好的礼物。",
  "不解释的，才叫从容。不执着的，才叫看破。不完美的，才叫人生。",
  "人生不可能一帆风顺，有成功，也有失败；有开心，也有失落。如果我们把生活中的这些起起落落看得太重，那么生活对于我们来说永远都不会坦然，永远都没有欢笑。人生应该有所追求，但暂时得不到并不会阻碍日常生活的幸福，因此，拥有一颗平常心，是人生最重要的。",
  "余生还很长，别把一切都提前交代了，一边走一边欣赏风景，一切都要慢慢来。",
  "疲倦的生活里，总要有些温柔的梦想，愿一切真心不被辜负，愿一切努力终有收获，愿一切如你所愿。",
  "不管你有多忙碌，也不要丢弃对生活的热情；不管你过得多糟糕，也不要失去乐观的态度，更不要逃避，诅咒它。生活不易，但求一句‘我已竭尽全力'。",
];
const str = praiseStatement[Math.floor(Math.random(10) * praiseStatement.length)];

// 获取ONE内容
function getOneData() {
  let p = new Promise(function(resolve, reject) {
    superagent.get(OneUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      let $ = cheerio.load(res.text);
      let selectItem = $("#carousel-one .carousel-inner .item");
      let todayOne = selectItem[0];
      let todayOneData = {
        imgUrl: $(todayOne)
          .find(".fp-one-imagen")
          .attr("src"),
        // type: $(todayOne)
        //   .find(".fp-one-imagen-footer")
        //   .text()
        //   .replace(/(^\s*)|(\s*$)/g, ""),
        text: $(todayOne)
          .find(".fp-one-cita")
          .text()
          .replace(/(^\s*)|(\s*$)/g, ""),
        mytext: praiseStatement[Math.floor(Math.random(10) * praiseStatement.length)],
      };
      resolve(todayOneData)
    });
  })
  return p
}

// 获取天气提醒
function getWeatherTips() {
  let p = new Promise(function(resolve, reject) {
    superagent.get(WeatherUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      let threeDaysData = [];
      let weatherTip = "";
      let $ = cheerio.load(res.text);
      $(".wea_tips").each(function(i, elem) {
        weatherTip = $(elem)
          .find("em")
          .text();
      });
      resolve(weatherTip)
    });
  })
  return p
}

// 获取现在的天气
function getCurrentWeather() {
  let p = new Promise(function(resolve, reject) {
    superagent.get(WeatherUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      let currentWeather = " ";
      let $ = cheerio.load(res.text);
      $(".wea_info .left").each(function(i, elem) {
        const weatherInfo = $(elem).find("div");
        currentWeather = {
          PollutionLevel: $(weatherInfo[0])
            .find("em")
            .attr("class"),
          Temperature: $(weatherInfo[1])
            .find("em")
            .text(),
          // .replace(/(^\s*)|(\s*$)/g, ""),
          WeatherImgUrl: $(weatherInfo[1])
            .find("img")
            .attr("src"),
          WeatherText: $(weatherInfo[1])
            .find("b")
            .text(),
          // .replace(/(^\s*)|(\s*$)/g, ""),
          WeatherTime: $(weatherInfo[1])
            .find("strong")
            .text(),
          WindDirection: $(weatherInfo[2])
            .find("em")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Humidity: $(weatherInfo[2])
            .find("span")
            .text()
            .replace(/(^\s*)|(\s*$)/g, "")
        };
      });
      resolve(currentWeather)
    });
  });
  return p
}


// 获取天气预报
function getWeatherData() {
  let p = new Promise(function(resolve, reject) {
    superagent.get(WeatherUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      let threeDaysData = [];
      let weatherTip = "";
      let $ = cheerio.load(res.text);
      $(".forecast .days").each(function(i, elem) {
        const SingleDay = $(elem).find("li");
        threeDaysData.push({
          Day: $(SingleDay[0])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WeatherImgUrl: $(SingleDay[1])
            .find("img")
            .attr("src"),
          WeatherText: $(SingleDay[1])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Temperature: $(SingleDay[2])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WindDirection: $(SingleDay[3])
            .find("em")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WindLevel: $(SingleDay[3])
            .find("b")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Pollution: $(SingleDay[4])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          PollutionLevel: $(SingleDay[4])
            .find("strong")
            .attr("class")
        });
      });
      resolve(threeDaysData)
    });
  });
  return p
}

// 发动邮件
function sendMail(HtmlData) {
  const template = ejs.compile(
    fs.readFileSync(path.resolve(__dirname, "email.ejs"), "utf8")
  );
  const html = template(HtmlData);

  let transporter = nodemailer.createTransport({
    service: EmianService,
    port: 465,
    secureConnection: true,
    auth: EamilAuth,
    secure: true,
  });

  let mailOptions = {
    from: EmailFrom,
    to: EmailTo,
    subject: EmailSubject,
    html: html
  };
  transporter.sendMail(mailOptions, (error, info = {}) => {
    if (error) {
      console.log(error);
      sendMail(HtmlData); //再次发送
    }
    console.log("邮件发送成功", info.messageId);
    console.log("静等下一次发送");
  });
}

// 聚合
function getAllDataAndSendMail() {
  let HtmlData = {};
  // how long with
  let today = new Date();
  console.log(today)
  let initDay = new Date(startDay);
  let lastDay = Math.floor((today - initDay) / 1000 / 60 / 60 / 24);
  let todaystr =
    today.getFullYear() +
    " / " +
    (today.getMonth() + 1) +
    " / " +
    today.getDate();
  HtmlData["lastDay"] = lastDay;
  HtmlData["todaystr"] = todaystr;

  Promise.all([getOneData(), getCurrentWeather(), getWeatherTips(), getWeatherData()]).then(
    function(data) {
      HtmlData["todayOneData"] = data[0];
      HtmlData["currentWeather"] = data[1];
      HtmlData["weatherTip"] = data[2];
      HtmlData["threeDaysData"] = data[3];
      sendMail(HtmlData)
    }
  ).catch(function(err) {
    getAllDataAndSendMail() //再次获取
    console.log('获取数据失败： ', err);
  })
}

let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = EmailHour;
rule.minute = EmialMinminute;
console.log('NodeMail: 开始等待目标时刻...')
let j = schedule.scheduleJob(rule, function() {
  console.log("执行任务");
  getAllDataAndSendMail();
});