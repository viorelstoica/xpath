import * as fs from 'fs'
import * as xpath from 'xpath'
import * as dom from '@xmldom/xmldom'
import * as colors from 'colors'

const xsltPath = '/mnt/o/services/clients/mirabaud/xslt/20260330'
const xsltFile = process.argv[2]
const xml = await getXmlFile(`${xsltPath}/${xsltFile}/${xsltFile}-Filter-Core.xsl`)
const doc = new dom.DOMParser().parseFromString(xml, 'text/xml');
const select = xpath.useNamespaces({
  "xsl": "http://www.w3.org/1999/XSL/Transform"
})

var nodes = select("/xsl:stylesheet", doc);
for (let i = 0; i < nodes[0].attributes.length; i++) {
  if (nodes[0].attributes[i].name.startsWith('xmlns'))
    console.log(nodes[0].attributes[i].name, nodes[0].attributes[i].value)
}

for (let i = 0; i < nodes[0].childNodes.length; i++) {
  let child = nodes[0].childNodes[i]
  if (child.nodeName != "#text" && child.nodeName != "#comment") {
    console.log(child.nodeName)
    var mode = select("@mode", child);
    for (let j = 0; j < child.childNodes.length; j++) {
      let child2 = child.childNodes[j]
      if (child2.nodeName != "#text" && child2.nodeName != "#comment") {
        console.log('  ', child2.nodeName, mode)
      }
    }

  }
}

//console.log(nodes[0].childNodes[0])

function getXmlFile(file) {
  return new Promise((resolve) => {
    fs.readFile(`${file}`, 'utf8', function (err, data) {
      if (err) {
        console.log(err)
      }
      resolve(data)
    })
  })
}

