import * as fs from 'fs'
import * as xpath from 'xpath'
import * as dom from '@xmldom/xmldom'
import * as colors from 'colors'

function getXmlFile(file) {
  return new Promise((resolve) => {
    fs.readFile(`${file}`, 'utf8', function (err, data) {
      //var json = xml2json.toJson(data, { "object": true });
      resolve(data)
    })
  })
}
const inputFile = process.argv[2]
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

  let arrangement = select("b:aaArrangementId", n)[0].firstChild.data
  let masterActivity = select("b:aaMasterActivity", n)[0].firstChild.data
  let activityId = select("b:aaArrActivityId", n)[0].firstChild.data
  let portfolio = select("b:aaPortfolioId", n)[0].firstChild.data
  let effectiveDate = select("b:aaEffectiveDate", n)[0].firstChild.data
  let recActivityId = select("../c:aaarecord/d:activity", n)[0].firstChild.data
  console.log(`************************************`)
  console.log(`   masterActivity: ${masterActivity}`)
  console.log(`   arrangement:    ${arrangement}`)
  console.log(`   activityId:     ${activityId}`)
  console.log(`   portfolio:      ${portfolio}`)
  console.log(`   effectiveDate:  ${effectiveDate}`)
  let billDetails = select("../c:recaccountdetails/f:actBillDetails", n)
  let billIdPayoff = ''
  billDetails.forEach(bill => {
    let billId = select("f:billId", bill)[0].firstChild.data
    let billType = select("f:billType", bill)[0].firstChild.data
    if (billType === 'PAYOFF') {
      billIdPayoff = billId
      console.log(`   billId: ${billId} billType: ${billType}`.red)
    }
    else
      console.log(`   billId: ${billId} billType: ${billType}`)

  })

  console.log('   Bills:')
  let bills = select("../c:billdetails", n)
  bills.forEach(bill => {
    let aaBillId = select("j:aaBillId", bill)[0].firstChild.data
    let currency = select("j:currency", bill)[0].firstChild.data
    if (aaBillId === billIdPayoff)
      console.log(`         ${aaBillId} ${currency}`.red)
    else
      console.log('        ', aaBillId, currency)
    let properyDetails = select("j:billProperyDetails", bill)
    properyDetails.forEach(p => {
      let property = select("j:property", p)[0].firstChild.data
      console.log('           ', property)
    })
  })
}

/*
    
../c:intaccrualrecords[k:intAccrualId = concat(../c:aatxncontext/b:aaArrangementId, '-', $interestType)]/k:totalAccrual[k:periodStart &lt; ../../c:aaarecord/d:effectiveDate 
                            and (not(k:periodEnd) or k:periodEnd &gt;= ../../c:aaarecord/d:effectiveDate)]/k:totRpyAmt"/>
        <xsl:choose></xsl:choose>


        Object.keys(n.childNodes).forEach(k => {
        if(n.childNodes[k].nodeName != "#text" && n.childNodes[k].nodeName != "length")
            console.log('   ', n.childNodes[k].nodeName)
    })
*/
