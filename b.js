var node = null;
var xml = "<book author='J. K. Rowling'><title>Harry Potter</title></book>";
var doc = new dom().parseFromString(xml, 'text/xml');
var result = xpath.evaluate(
    "/book/title",            // xpathExpression
    doc,                        // contextNode
    null,                       // namespaceResolver
    xpath.XPathResult.ANY_TYPE, // resultType
    null                        // result
);

node = result.iterateNext();
while (node) {
    console.log(node.localName + ": " + node.firstChild.data);
    console.log("Node: " + node.toString());

    node = result.iterateNext();
}
