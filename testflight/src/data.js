export const I18N={
 en:{title:"Taipei Trail Finder",intro:"Tell it where you're staying and how much time you have. It picks runs and hikes that fit, nearest first.",
  where:"Where you are starting",hotelPh:"Hotel name, address, or paste a Google Maps link",set:"Set",finding:"Finding…",stationPick:"Or pick the nearest MRT station…",
  activity:"Activity",run:"Run",hike:"Hike",either:"Either",distance:"Distance",any:"Any",timeOn:"Time on the trail",t30:"30 min",t60:"1 hr",t120:"2 hr",t240:"Half day",
  maxTravel:"Max travel each way",m15:"15 min",pace:"Run pace",hikeStyle:"Hike style",relaxed:"Relaxed",steady:"Steady",fast:"Fast",
  from:"From ",mrtSuffix:" MRT",pinned:"Pinned location",approx:" (approx.)",
  fit:n=>`${n} route${n>1?"s":""} that fit`,nomatch:"No exact match",onTrail:"on trail",away:m=>`≤ ${m} min away`,
  empty:'Nothing fits all three limits. Try "Any" for travel time, or a longer time window.',
  top:"Top pick · ",sDist:"Distance",sClimb:"Climb",sOn:"On trail",sTravel:"Travel each way",nav:"Navigate",info:"Trail info",
  laps:(n,k)=>`${n} laps of the ${k} km loop`,outback:k=>`Out-and-back, turn around at ${k} km`,full:"Full route",
  planTxt:(how,mrt,tot)=>`${how}. Nearest MRT: ${mrt}. Door to door about ${tot}.`,
  noSample:"Hotel lookup isn't available here. Paste coordinates or a Google Maps link, or pick the nearest MRT station.",
  notFound:"Couldn't place that one. Try the full hotel name with the district, paste a Google Maps link, or pick the nearest MRT station.",
  noPerm:"Hotel lookup needs permission. Pick the nearest MRT station instead.",fail:"Lookup failed. Pick the nearest MRT station or paste coordinates.",
  min:"min",h:"h",
  footer:"Estimates: running uses your pace plus about 6 min per 100 m of climb. Hiking uses 15 min/km plus 10 min per 100 m of climb (Naismith's rule), scaled by hike style. Travel is a straight-line guess for MRT or taxi; tap Navigate for real transit times. Distances and climbs are approximate. Check trail conditions, heat, and typhoon or heavy-rain closures before you go."},
 zh:{title:"台北任你/妳跑",intro:"告訴我你住哪裡、有多少時間，我會挑出適合的跑步與健行路線，由近到遠排列。",
  where:"出發地點",hotelPh:"飯店名稱、地址，或貼上 Google 地圖連結",set:"設定",finding:"搜尋中…",stationPick:"或選擇最近的捷運站…",
  activity:"活動",run:"跑步",hike:"健行",either:"都可以",distance:"距離",any:"不限",timeOn:"運動時間",t30:"30 分鐘",t60:"1 小時",t120:"2 小時",t240:"半天",
  maxTravel:"單程交通上限",m15:"15 分鐘",pace:"跑步配速",hikeStyle:"健行步調",relaxed:"輕鬆",steady:"穩定",fast:"快速",
  from:"從 ",mrtSuffix:" 捷運站",pinned:"自訂座標",approx:"（約略）",
  fit:n=>`共 ${n} 條符合的路線`,nomatch:"沒有完全符合的路線",onTrail:"運動時間",away:m=>`${m} 分鐘內抵達`,
  empty:"沒有同時符合三項條件的路線。試試把交通時間設為「不限」，或延長運動時間。",
  top:"首選 · ",sDist:"距離",sClimb:"爬升",sOn:"運動時間",sTravel:"單程交通",nav:"導航",info:"步道資訊",
  laps:(n,k)=>`繞 ${k} 公里環線 ${n} 圈`,outback:k=>`折返路線，在 ${k} 公里處折返`,full:"完整路線",
  planTxt:(how,mrt,tot)=>`${how}。最近捷運站：${mrt}。來回總計約 ${tot}。`,
  noSample:"此處無法使用飯店搜尋。請貼上座標或 Google 地圖連結，或選擇最近的捷運站。",
  notFound:"找不到這個地點。請輸入完整飯店名稱與行政區、貼上 Google 地圖連結，或選擇最近的捷運站。",
  noPerm:"飯店搜尋需要授權，請改選最近的捷運站。",fail:"搜尋失敗，請選擇最近的捷運站或貼上座標。",
  min:" 分鐘",h:" 小時",
  footer:"估算方式：跑步以你的配速計算，每爬升 100 公尺約加 6 分鐘。健行以每公里 15 分鐘計算，每爬升 100 公尺加 10 分鐘（奈史密斯法則），再依健行步調調整。交通時間為搭捷運或計程車的直線距離估算，請點「導航」查看實際大眾運輸時間。距離與爬升均為約略數值。出發前請確認步道狀況、高溫，以及颱風或豪雨封閉資訊。"}
};
export const TRAILS=[
 {n:"Da'an Forest Park loop",zh:"大安森林公園",t:"run",lat:25.0300,lng:121.5357,km:2.3,gain:0,flex:15,mrt:"Daan Park",mrtZh:"大安森林公園站",note:"Flat shaded loop in the city center. Add laps to reach any distance.",noteZh:"市中心平坦林蔭環線，多跑幾圈即可達到想要的距離。"},
 {n:"Elephant Mountain",zh:"象山步道",t:"hike",lat:25.0275,lng:121.5707,km:1.8,gain:180,mrt:"Xiangshan",mrtZh:"象山站",note:"Steep stairs to the classic Taipei 101 viewpoint. Busy at sunset.",noteZh:"陡峭階梯直上經典台北101觀景點，夕陽時段人潮多。"},
 {n:"Four Beasts Mountain loop",zh:"四獸山",t:"both",lat:25.0275,lng:121.5707,km:5.5,gain:380,mrt:"Xiangshan",mrtZh:"象山站",note:"Links Elephant, Tiger, Leopard and Lion peaks. Good trail-run workout.",noteZh:"串連象山、虎山、豹山、獅山，很適合越野跑訓練。"},
 {n:"Tiger Mountain trail",zh:"虎山步道",t:"hike",lat:25.0362,lng:121.5810,km:3,gain:200,mrt:"Houshanpi / Xiangshan",mrtZh:"後山埤站／象山站",note:"Quieter forest trail with streams and city views.",noteZh:"較安靜的森林步道，有溪流與城市景觀。"},
 {n:"Taipei Expo Park & Xinsheng Park",zh:"花博公園",t:"run",lat:25.0705,lng:121.5235,km:3,gain:0,flex:12,mrt:"Yuanshan",mrtZh:"圓山站",note:"Flat paved loops around the Expo grounds and Fine Arts Museum.",noteZh:"花博園區與美術館周邊的平坦環線。"},
 {n:"Dajia Riverside Park",zh:"大佳河濱公園",t:"run",lat:25.0730,lng:121.5370,km:5,gain:0,flex:20,mrt:"Jiannan Rd / Dazhi",mrtZh:"劍南路站／大直站",note:"Wide riverside path on the Keelung River. Out-and-back to any length.",noteZh:"基隆河畔寬敞步道，可折返跑任意距離。"},
 {n:"Meiti Riverside Park",zh:"美堤河濱公園",t:"run",lat:25.0790,lng:121.5550,km:5,gain:0,flex:20,mrt:"Jiannan Rd",mrtZh:"劍南路站",note:"Flat river path with views of Miramar Ferris wheel. Connects to Dajia.",noteZh:"平坦河濱步道，可遠眺美麗華摩天輪，與大佳河濱相連。"},
 {n:"Rainbow Riverside Park",zh:"彩虹河濱公園",t:"run",lat:25.0560,lng:121.5760,km:5,gain:0,flex:16,mrt:"Songshan",mrtZh:"松山站",note:"East-side riverside path by Rainbow Bridge and Raohe Night Market.",noteZh:"東區河濱步道，鄰近彩虹橋與饒河夜市。"},
 {n:"Dadaocheng Wharf river path",zh:"大稻埕碼頭",t:"run",lat:25.0566,lng:121.5084,km:5,gain:0,flex:20,mrt:"Beimen / Daqiaotou",mrtZh:"北門站／大橋頭站",note:"Tamsui River path heading north. Great at sunset.",noteZh:"沿淡水河向北延伸，夕陽時分最美。"},
 {n:"Jiantan Mountain trail",zh:"劍潭山步道",t:"both",lat:25.0838,lng:121.5290,km:3.5,gain:170,mrt:"Jiantan",mrtZh:"劍潭站",note:"Ridge above the Grand Hotel with wide city views.",noteZh:"圓山大飯店後方稜線，台北市景一覽無遺。"},
 {n:"Jinmianshan (Golden Face Rock)",zh:"金面山",t:"hike",lat:25.0828,lng:121.5672,km:3,gain:250,mrt:"Xihu",mrtZh:"西湖站",note:"Rocky scramble to a big view over Neihu and Taipei 101.",noteZh:"岩石攀爬路段，可俯瞰內湖與台北101。"},
 {n:"Junjianyan (Battleship Rock)",zh:"軍艦岩",t:"hike",lat:25.1255,lng:121.5130,km:3,gain:150,mrt:"Shipai / Qilian",mrtZh:"石牌站／唭哩岸站",note:"Short loop to a sandstone outcrop above Beitou.",noteZh:"北投上方砂岩地形的短程環線。"},
 {n:"Tianmu Old Trail",zh:"天母古道",t:"hike",lat:25.1300,lng:121.5340,km:4,gain:300,mrt:"Zhishan (then bus)",mrtZh:"芝山站（轉公車）",note:"About 1,800 steps along an old water pipe. Out-and-back to Sanjiao Puzi.",noteZh:"沿古老水管路約 1,800 階，折返至三角埔。"},
 {n:"Zhinan Temple stairs",zh:"指南宮步道",t:"hike",lat:24.9790,lng:121.5800,km:2.5,gain:250,mrt:"Taipei Zoo / Zhengda",mrtZh:"動物園站／政大",note:"Stone stairs up to the Zhinan Temple complex. Combine with Maokong.",noteZh:"石階直上指南宮，可順遊貓空。"},
 {n:"Bitan riverside",zh:"碧潭",t:"run",lat:24.9570,lng:121.5370,km:4,gain:0,flex:12,mrt:"Xindian",mrtZh:"新店站",note:"Flat path along the Xindian River by the suspension bridge.",noteZh:"新店溪畔平坦步道，鄰近碧潭吊橋。"},
 {n:"Zhongzheng Mountain",zh:"中正山",t:"hike",lat:25.1490,lng:121.5050,km:4.5,gain:400,mrt:"Beitou (then bus)",mrtZh:"北投站（轉公車）",note:"Steady climb with a top view over the Guandu plain and Tamsui River.",noteZh:"穩定爬升，山頂可眺望關渡平原與淡水河。"},
 {n:"Qixing Mountain summit",zh:"七星山",t:"hike",lat:25.1810,lng:121.5480,km:5,gain:450,mrt:"Bus from Jiantan / Shilin",mrtZh:"劍潭站／士林站轉公車",note:"Taipei's highest peak (1,120 m). Volcanic vents and big views. Go early.",noteZh:"台北最高峰（1,120 公尺），有火山噴氣孔與壯闊視野，建議早點出發。"},
 {n:"Huangdi Dian ridge",zh:"皇帝殿",t:"hike",lat:24.9940,lng:121.6420,km:7,gain:450,mrt:"Bus from Muzha",mrtZh:"木柵轉公車",note:"Exposed rocky knife-edge ridge with chains. Experienced hikers, dry days only.",noteZh:"裸露岩稜需拉繩索，僅適合有經驗者於乾燥天氣前往。"}
];
export const STATIONS=[
 ["Taipei Main Station","台北車站",25.0478,121.5170],["Ximen","西門",25.0420,121.5081],["Zhongshan","中山",25.0527,121.5203],["Shuanglian","雙連",25.0577,121.5206],
 ["Minquan W. Rd","民權西路",25.0626,121.5193],["Yuanshan","圓山",25.0713,121.5201],["Dongmen","東門",25.0339,121.5287],["Daan","大安",25.0330,121.5435],
 ["Zhongxiao Fuxing","忠孝復興",25.0416,121.5437],["Zhongxiao Dunhua","忠孝敦化",25.0414,121.5513],["Nanjing Fuxing","南京復興",25.0520,121.5441],["Songjiang Nanjing","松江南京",25.0520,121.5330],
 ["Xinyi Anhe","信義安和",25.0333,121.5527],["Taipei 101 / World Trade Center","台北101／世貿",25.0330,121.5637],["City Hall","市政府",25.0412,121.5651],["Songshan Airport","松山機場",25.0630,121.5519],
 ["Neihu","內湖",25.0837,121.5944],["Nangang","南港",25.0521,121.6070],["Gongguan","公館",25.0147,121.5343],["Beitou","北投",25.1318,121.4986],
 ["Tamsui","淡水",25.1678,121.4455],["Banqiao","板橋",25.0141,121.4630]
];

Object.assign(I18N.en,{gps:"Use my location",locating:"Locating…",gpsDenied:"Location permission was denied. Pick a station or type your hotel.",gpsFail:"Couldn't get your location. Pick a station or type your hotel.",myLoc:"My current location",hotelPh2:"Hotel name or address",pickStation:"Pick MRT station",close:"Close",estTitle:"How estimates work"});
Object.assign(I18N.zh,{gps:"使用目前位置",locating:"定位中…",gpsDenied:"未取得定位權限，請選擇捷運站或輸入飯店名稱。",gpsFail:"無法取得目前位置，請選擇捷運站或輸入飯店名稱。",myLoc:"目前位置",hotelPh2:"飯店名稱或地址",pickStation:"選擇捷運站",close:"關閉",estTitle:"估算方式"});
