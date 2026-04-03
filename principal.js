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


/*
  <xsl:template match="c:aaarecord">
  <xsl:variable name="var_aaArrActivityId" select="../c:aatxncontext/b:aaArrActivityId"/>

(d:activity = 'LENDING-APPLYPAYMENT-PR.PRINCIPAL.DECREASE' or d:activity = 'LENDING-APPLYPAYMENT-PR.REPAYMENT'  or d:activity = 'LENDING-APPLYPAYMENT-PR.CURRENT.BALANCES')
and ../c:accountrecord/g:portfolioId != ''  and ../c:aatxncontext/b:aaArrStatus != 'PENDING.CLOSURE' and ../c:aatxncontext/b:aaArrStatus != 'EXPIRED'
and  ../c:aatxncontext/b:aaMasterActivity != 'LENDING-SETTLE-PAYOFF' 
and (not(../c:aatxncontext/b:aaActivityStatus) or ../c:aatxncontext/b:aaActivityStatus != 'REV') 
and (	(../c:billdetails/j:billProperyDetails[j:property = 'ACCOUNT' and starts-with(j:repayRef, $var_aaArrActivityId)]) 
		or (../c:ftrecord and ../c:ftrecord/l:amountDebited != '') 

		or (../c:intaccrualrecords[k:intAccrualId = concat(../c:aatxncontext/b:aaArrangementId, '-', 'PRINCIPALINT')]/k:totalAccrual[k:periodStart &lt; ../../c:aaarecord/d:effectiveDate and (not(k:periodEnd) or k:periodEnd &gt;= ../../c:aaarecord/d:effectiveDate)]/k:totRpyAmt) 

		or (../c:intaccrualrecords[k:intAccrualId = concat(../c:aatxncontext/b:aaArrangementId, '-', 'PRINCIPALINT')]/k:totalAccrual[k:periodStart &lt; ../../c:aaarecord/d:effectiveDate and (not(k:periodEnd) or k:periodEnd &gt;= ../../c:aaarecord/d:effectiveDate)]/k:totRpyAmt)
	)


*/
var nodes = select("/batch:BatchAAAFlow/c:AAAFlow", doc);
console.log(`The batch contains ${nodes.length} records`)
for (let i = 0; i < nodes.length; i++) {
  let n = nodes[i]
  let aarecord = select("c:aaarecord", n)
  if (aarecord.length == 0) {
    console.log(`AAAFlow number ${i}: no aaarecord element`)
    continue
  }
  let aaArrActivityId = select("c:aatxncontext/b:aaArrActivityId", n)[0].firstChild.data
  let activity = select("c:aaarecord/d:activity", n)[0].firstChild.data
  let effectiveDate = select("c:aaarecord/d:effectiveDate", n)[0].firstChild.data
  let masterActivity = select("c:aatxncontext/b:aaMasterActivity", n)[0].firstChild.data
  let aaArrStatus = select("c:aatxncontext/b:aaArrStatus", n)[0].firstChild.data
  let aaArrangementId = select("c:aatxncontext/b:aaArrangementId", n)[0].firstChild.data
  let aaActivityStatus = select("c:aatxncontext/b:aaActivityStatus", n)
  let portfolioId = select("c:accountrecord/g:portfolioId", n)[0].firstChild.data
  console.log(`AAAFlow number ${i}:`)
  console.log(`   aaArrActivityId:   ${aaArrActivityId}`)
  console.log(`   aaArrSatatus:      ${aaArrStatus}`)
  console.log(`   effectiveDate:     ${effectiveDate}`)
  console.log(`   aaArrangementId:   ${aaArrangementId}`)
  console.log(`   aaActivityStatus:  ${aaActivityStatus.length > 0 ? aaActivityStatus[0].firstChild.data : ''}`)
  if (['LENDING-APPLYPAYMENT-PR.PRINCIPAL.DECREASE', 'LENDING-APPLYPAYMENT-PR.REPAYMENT', 'LENDING-APPLYPAYMENT-PR.CURRENT.BALANCES'].includes(activity))
    console.log(`   activity:          ${activity}`.red)
  else
    console.log(`   activity:          ${activity}`)
  console.log(`   masterActivity:    ${masterActivity}`)
  if (portfolioId)
    console.log(`   portfolio:         ${portfolioId}`.red)
  else
    console.log(`   activity:          ${activity}`)

  // check ../c:billdetails/j:billProperyDetails[j:property = 'ACCOUNT' and starts-with(j:repayRef, $var_aaArrActivityId)]
  console.log("   bills:")
  let billDetailsId = select("c:billdetails", n)
  billDetailsId.forEach(b => {
    let properyDetails = select("j:billProperyDetails", b)
    properyDetails.forEach(p => {
      console.log(`      porperty: ${select("j:property", p)[0].firstChild.data}`)
      let repayRef = select("j:repayRef", p)[0].firstChild.data
      if(repayRef.startsWith(aaArrActivityId))
        console.log(`      repayRef: ${repayRef}`.red)
      else
        console.log(`      repayRef: ${repayRef}`)
    })
  })

  // check ../c:ftrecord and ../c:ftrecord/l:amountDebited != ''
  let ftrecord = select("c:ftrecord/l:amountDebited", n)
  if(ftrecord.length > 0)
    console.log(`   ftrecord: ${ftrecord[0].firstChild.data}`)
  else
    console.log(`   ftrecord: `)

  // check 	or (../c:intaccrualrecords[k:intAccrualId = concat(../c:aatxncontext/b:aaArrangementId, '-', 'PRINCIPALINT')]/k:totalAccrual[k:periodStart &lt; ../../c:aaarecord/d:effectiveDate and (not(k:periodEnd) or k:periodEnd &gt;= ../../c:aaarecord/d:effectiveDate)]/k:totRpyAmt) 
  console.log("   intaccrualrecords:")
  let intaccrualrecords = select("c:intaccrualrecords", n)
  intaccrualrecords.forEach(iar => {
    let intAccrualId = select("k:intAccrualId", iar)[0].firstChild.data
    let totalAccrual = select("k:totalAccrual", iar)
    console.log(`      intAccrualId: ${intAccrualId}`)
    console.log(`      intAccrualId: ${totalAccrual}`)
  })

  //check or (../c:intaccrualrecords[k:intAccrualId = concat(../c:aatxncontext/b:aaArrangementId, '-', 'PRINCIPALINT')]/k:totalAccrual[k:periodStart &lt; ../../c:aaarecord/d:effectiveDate and (not(k:periodEnd) or k:periodEnd &gt;= ../../c:aaarecord/d:effectiveDate)]/k:totRpyAmt)

  console.log()
}