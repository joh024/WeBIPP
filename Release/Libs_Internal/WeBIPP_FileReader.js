wbip.filereader = function(){
  var obj = {tags: "file-reader"};
  
  obj.JSON =
    function(name, file){
      var Reader = new FileReader();
      Reader.onload = function(evt){
        wbip.datanew(name, evt.target.result);
      };
      Reader.readAsText(file);
    };
  
  obj.JSONmult =
    function(files){
      for(var i = 0; i < files.length; i++){
        // Remove extension to shorten name a bit
        var name = files[i].name.replace(/\..+?$/, "");
        obj.JSON(name, files[i]);
      }
    };
  
  obj.CSV =
    function(name, file){
      var Reader = new FileReader();
      Reader.onload = function(evt){
        var res = evt.target.result;
        // Parse using PapaParse
        var parseraw = Papa.parse(res, {
          dynamicTyping: true,
          skipEmptyLines: true
        });
        // print the result to console, might have performance penalties
        console.log("CSV Parse Result");
        console.log(parseraw);
        
        // Convert to JSON format desired by wbip
        var tdat = wbip.utils.transpose(parseraw.data);
        var jsobj = tdat.reduce(function(prev, cur){
          var name = cur.shift();
          prev[name] = cur;
          return prev;
        }, {});
        
        // Display to user, for cleaning
        // TODO when data processing capabilities added
        
        // Accept data
        wbip.datanew(name, JSON.stringify(jsobj));
      };
      Reader.readAsText(file);
    };
  
  obj.CSVmult =
    function(files){
      for(var i = 0; i < files.length; i++){
        // Remove extension to shorten name a bit
        var name = files[i].name.replace(/\..+?$/, "");
        obj.CSV(name, files[i]);
      }
    };
  
  obj.wbip =
    function(file){
      var name = file.name;
      var Reader = new FileReader();
      Reader.onload = function(evt){
        var res = evt.target.result;
        // Extract header info
        var resmatch = res.match(/(\/\*WBIP SAVE HEADER)({[^]+})(END\*\/\n)([^]+)/m);
        var header = JSON.parse(resmatch[2]);
        // Check version
        // Check addons
        // Set dim
        if(header.dim !== undefined){
          wbip.layout.dim = header.dim;
        }
        wbip.new();
        // Set ELIndex
        wbip.vars.ELIndex = header.ELIndex;
        var codereal = resmatch[4];
        // Set code to cm
        wbip.cm.high.setValue(codereal);
        wbip.cm.higheval();
      };
      Reader.readAsText(file);
    };
  
  //Reading from URL
  //var req = new XMLHttpRequest()
  //req.open("GET", "https://www.stat.auckland.ac.nz/~joh024/Research/WeBIPP/Examples/save_NileLine.txt")
  //req.send()
  // Might also be better to just enable direct copy+paste
  
  return obj;
}();
