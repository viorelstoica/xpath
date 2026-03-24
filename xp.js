var exampleLookup = `//*[@id='System_Console_WriteLine_System_String_System_Object_System_Object_System_Object_']/parent::x:div/following-sibling::x:div/x:pre[position()>1]/x:code[contains(@class,'lang-csharp')]`
var doc = new dom().parseFromString(rawHtmlString, 'text/html')
console.log(dom)
