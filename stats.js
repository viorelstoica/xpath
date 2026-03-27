import * as fs from 'fs'
import * as xpath from 'xpath'
import * as dom from '@xmldom/xmldom'
import * as colors from 'colors'

const baseDataFolder = "../logs/data"
const day = process.argv[2]

let files = await getFiles(`${baseDataFolder}/${day}/trace/`)
let applications = await getApplications(files)
console.log(applications)

async function getApplications(files) {
  return new Promise(async (resolve) => {
    let ret = {}
    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      let application = await getApplicationFromFile(file.dir, file.file)
      if (ret[application])
        ret[application] = ret[application] + 1
      else
        ret[application] = 1
    }
    resolve(ret)
  })
}

async function getXmlFile(file) {
  return new Promise((resolve) => {
    fs.readFile(`${file}`, 'utf8', function (err, data) {
      //var json = xml2json.toJson(data, { "object": true });
      resolve(data)
    })
  })
}

async function getFiles(dir) {
  return new Promise((resolve) => {
    let dirs = fs.readdirSync(dir)
    var ret = []
    dirs.forEach(async dir => {
      let files = fs.readdirSync(`${baseDataFolder}/${day}/trace/${dir}/`)
      files = files.filter(file => file.match(/msgin/)).filter(file => !file.match(/F2B/)).map(file => ret.push({ dir: dir, file: file }))
    })
    resolve(ret)
  })
}

async function getApplicationFromFile(dir, file) {
  let xml = await getXmlFile(`${baseDataFolder}/${day}/trace/${dir}/${file}`)
  const doc = new dom.DOMParser().parseFromString(xml, 'text/xml');
  const select = xpath.useNamespaces({ "ns0": "http://www.temenos.com/T24/event/Common/EventCommon" })
  const application = await select("//ns0:application", doc)[0].firstChild.data
  return application
}

/*
files.forEach(async file => {
  if (file.match('msgin')) {
    let xml = await getXmlFile(`${baseDataFolder}/${day}/trace/${dir}/${file}`)
    const doc = new dom.DOMParser().parseFromString(xml, 'text/xml');
    const select = xpath.useNamespaces({ "ns0": "http://www.temenos.com/T24/event/Common/EventCommon" })
    const rootElm = select("/", doc)[0].firstChild.data
    console.log(`${rootElm}`)
  }
})
*/

async function test(dir, file) {
  //console.log(`${baseDataFolder}/${day}/trace/${dir}/${file}`)
  let xml = await getXmlFile(`${baseDataFolder}/${day}/trace/${dir}/${file}`)
  const doc = new dom.DOMParser().parseFromString(xml, 'text/xml');
  const select = xpath.useNamespaces({ "ns0": "http://www.temenos.com/T24/event/Common/EventCommon" })
  const rootElm = select("//ns0:application", doc)
  if (rootElm[0]) {
    console.log(`${rootElm[0].firstChild.data}`)
  }
  else
    console.log(`${baseDataFolder}/${day}/trace/${dir}/${file}`)
}

/*
const xml = await getXmlFile(inputFile)
const doc = new dom.DOMParser().parseFromString(xml, 'text/xml');
const select = xpath.useNamespaces({
  "batch": "http://www.temenos.com/T24/event/AAAExtractor/BatchAAAFlow",
  "tns": "http://www.temenos.com/T24/event/AAAExtractor/AAAFlow",
  "ns0": "http://www.temenos.com/T24/event/Common/EventCommon",
  "fi": "http://www.odcgroup.com/FiPMS",
  "infra": "http://www.odcgroup.com/InfraPMS",
  "a": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrInterestRec",
  "b": "http://www.temenos.com/T24/AaActivityExtractorService/AaTransactionContext",
  "c": "http://www.temenos.com/T24/event/AAAExtractor/AAAFlow",
  "d": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrActivityRec",
  "e": "http://www.temenos.com/T24/AaActivityExtractorService/AaProductRec",
  "f": "http://www.temenos.com/T24/AaActivityExtractorService/AaAccountDetailsRec",
  "g": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrAccountRec",
  "h": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrSettlementRec",
  "i": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrengementRec",
  "j": "http://www.temenos.com/T24/AaActivityExtractorService/AaBillRec",
  "k": "http://www.temenos.com/T24/AaActivityExtractorService/AaIntAccrualRec",
  "l": "http://www.temenos.com/T24/AaActivityExtractorService/AaFtRecord"

});

var nodes = select("/batch:BatchAAAFlow/tns:AAAFlow/tns:aatxncontext", doc);
console.log(`The batch contains ${nodes.length} records`)
//loop through AAAFlow records
for (let i = 0; i < nodes.length; i++) {
  let n = nodes[i]
  // check if there is an element aarecord
  let aarecord = select("../c:aaarecord", n)
  if (aarecord.length == 0) {
    console.log(`AAAFlow number ${i}: no aaarecord element`)
    continue
  }
  console.log(`AAAFlow number ${i}: `)
  // criterias for filtering
  let activityId = select("b:aaArrActivityId", n)[0].firstChild.data
  let payoffBillId = select("../c:recaccountdetails/f:actBillDetails[f:billType = 'PAYOFF']/f:billId", n)[0].firstChild.data
  let masterActivity = select("b:aaMasterActivity", n)[0].firstChild.data
  let activity = select("../c:aaarecord/d:activity", n)[0].firstChild.data
  let portfolio = select("b:aaPortfolioId", n)[0].firstChild.data
  let arrStatus = select("../c:recarrangement/i:arrStatus", n)[0].firstChild.data
  let activityStatus = select("b:aaActivityStatus", n)

  if(activity === masterActivity)
    console.log(`   aaarecord/activity:`,`                           ${activity}`.red)
  else
    console.log(`   aaarecord/activity:                            ${activity}`)
  console.log(`   aatxncontext/aaMasterActivity:                 ${masterActivity}`)
  console.log(`   aatxncontext/aaArrActivityId:                  ${activityId}`)
  console.log(`   aatxncontext/aaActivityStatus:                  ${activityStatus.length>0?activityStatus[0].firstChild.data : ''}`)
  console.log(`   billId from accountdetails with type PAYOFF:   ${payoffBillId}`)
  console.log(`   portfolio from accountrecord:                  ${portfolio}`)
  console.log(`   arrStatus from recarrangement:                 ${arrStatus}`)

  let billDetailsId = select("../c:billdetails", n)
  billDetailsId.forEach(b => {
    let billId = select("j:aaBillId", b)[0].firstChild.data
    if(billId === payoffBillId) {
      console.log(`       ${billId}`.red)
      let properyDetails = select("j:billProperyDetails", b)
      properyDetails.forEach(p => {
        console.log(`         ${select("j:property", p)[0].firstChild.data}`)
      })
    }
    else
      console.log(`       ${billId}`)
  })
  console.log()
}
  */
