wbip.filereader = function(){
  var obj = {tags: "file-reader"};
  
  obj.JSON =
    function(file){
      var name = file.name;
      Reader = new FileReader();
      Reader.onload = function(evt){
        wbip.datanew(name, evt.target.result);
      };
      Reader.readAsText(file);
    };
  
  obj.JSONmult =
    function(files){
      for(var i = 0; i < files.length; i++){
        obj.JSON(files[i]);
      }
    };
  
  obj.wbip =
    function(file){
      var name = file.name;
      Reader = new FileReader();
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
