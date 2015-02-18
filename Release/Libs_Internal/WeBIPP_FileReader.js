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
        // Split by delimiter
        
        // Display to user, for cleaning
        
        // Accept data
        // wbip.datanew(name, );
      };
      Reader.readAsText(file);
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
