import * as fs from 'fs'
import * as xpath from 'xpath'
import * as dom from '@xmldom/xmldom'

function getXmlFile(file) {
  return new Promise((resolve) => {
    fs.readFile(`${file}`, 'utf8', function (err, data) {
      //var json = xml2json.toJson(data, { "object": true });
      resolve(data)
    })
  })
}
const arg = process.argv[2]
const xml = await getXmlFile('msgin.xml')
const doc = new dom.DOMParser().parseFromString(xml, 'text/xml');
const select = xpath.useNamespaces({
    "d": "http://www.temenos.com/T24/event/AAAExtractor/BatchAAAFlow", 
    "tns": "http://www.temenos.com/T24/event/AAAExtractor/AAAFlow",
    "ns0": "http://www.temenos.com/T24/event/Common/EventCommon", 
    "ns1": "http://www.temenos.com/T24/AaActivityExtractorService/AaTransactionContext", 
    "ns2": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrengementRec", 
    "ns3": "http://www.temenos.com/T24/AaActivityExtractorService/AaAccountDetailsRec", 
    "ns4": "http://www.temenos.com/T24/AaActivityExtractorService/AaProductRec", 
    "ns5": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrInterestRec", 
    "ns6": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrActivityRec", 
    "ns8": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrAccountRec",
    "ns9": "http://www.temenos.com/T24/AaActivityExtractorService/AaArrSettlementRec", 
    "ns10": "http://www.temenos.com/T24/AaActivityExtractorService/AaBillRec", 
    "ns11": "http://www.temenos.com/T24/AaActivityExtractorService/AaIntAccrualRec"
});

var nodes = select("/d:BatchAAAFlow/tns:AAAFlow", doc);
nodes.forEach(n => {
    let common = select("tns:eventCommon/ns0:application", n)
    console.log(common[0].firstChild.data)
    Object.keys(n.childNodes).forEach(k => {
        if(n.childNodes[k].nodeName != "#text" && n.childNodes[k].nodeName != "length")
            console.log('   ', n.childNodes[k].nodeName)
    })
})
