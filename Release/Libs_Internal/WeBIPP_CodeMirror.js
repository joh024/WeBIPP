wbip.cm = function(){
  var obj = {tags: "ffw"};
  
  obj.new =
    function(svg, curID, dim, transxy, initval){
      transxy = wbip.defarg(transxy, [0, 0]);
      initval = wbip.defarg(initval, "initval");
      var ffw = wbip.ffw.new(svg, curID, dim, transxy);
      
      var ffwfo = ffw.append("foreignObject")
        .attr("width", dim[0])
        .attr("height", dim[1])
        .attr("transform", "translate(0,0)");
      // The reason for translate(0, 0)
      // https://bugzilla.mozilla.org/show_bug.cgi?id=984312
      
      ffwfo.append("xhtml:body").append("div")
          .attr("id", curID + "-cm");
      
      var cmvar = CodeMirror(document.getElementById(curID + "-cm"), {
        mode:  "javascript",
        firstLineNumber: 0,
        lineWrapping: true,
        lineNumbers: true,
        tabSize: 2,
        matchBrackets: true,
        highlightSelectionMatches: true
      });
      cmvar.setSize(width = dim[0] - 15, height = dim[1] - 15);
      cmvar.setValue(initval);
      
      // Change the exit button to merely hide
      var ffouter = d3.select(ffw[0][0].parentNode);
      ffouter.select(".wbip-ffw-bar-rem")
        .on("click", function(){ffouter.style("display", "none");});
      var cmshow = function(){
        ffouter.style("display", null);
        cmvar.refresh();
      };
      ffouter.style("display", "none");
      
      // Add a resize button to ffw
      var resizecm = function(){
        var innerbg = ffw.select(".wbip-ffw-inner-bg");
        var oridim = [Number(innerbg.attr("width")), Number(innerbg.attr("height"))];
        var curdim = oridim.slice(0);
        var drag = function(){
        };
        var dragend = function(newdim){
          wbip.ffw.dim(ffw, newdim);
          ffwfo.attr("width", newdim[0])
            .attr("height", newdim[1]);
          cmvar.setSize(width = newdim[0] - 15, height = newdim[1] - 15);
          cmvar.refresh();
        };
        var cancelfunc = function(){
          dragend(oridim);
          resizebtn(oridim);
        };
        //var returnfunc = function(curdim){
        //  resizebtn(curdim);
        //};
        
        wbip.utils.resize(ffresize, curdim, drag, dragend, cancelfunc, resizebtn, 10);
      };
      var ffresize = ffouter.append("g")
        .on("mousedown.drag", function(){d3.event.stopPropagation();});
      var resizebtn = function(dim){
        ffresize.append("rect")
          .attr("x", dim[0] - 10)
          .attr("y", dim[1] - 10)
          .attr("width", 10)
          .attr("height", 10)
          .on("click", function(){
            d3.select(this).remove();
            resizecm();
          });
      };
      resizebtn(dim);
      
      // Adjust plus/minus buttons to also show/hide resize button
      ffouter.select(".wbip-ffw-bar-show").on("click", function(){
        ffw.style("display", null);
        ffresize.style("display", null);
      });
      ffouter.select(".wbip-ffw-bar-hide").on("click", function(){
        ffw.style("display", "none");
        ffresize.style("display", "none");
      });
      
      return {cmvar: cmvar, cmshow: cmshow};
    };
  
  obj.defaults =
    function(svg){
      // wbip source
      var cmvars = obj.new(svg, "wbip-code-high", [600, 300], [200, 100], "");
      obj.high = cmvars.cmvar;
      obj.highshow = cmvars.cmshow;
      obj.higheval = function(){
        wbip.vars.gGraph.selectAll("*:not(.background)").remove();
        wbip.menuobj.clear();
        obj.low.setValue("");
        eval(obj.high.getValue());
      };
      // d3 source
      var cmvars = obj.new(svg, "wbip-code-low", [600, 400], [250, 200], "");
      obj.low = cmvars.cmvar;
      obj.lowshow = cmvars.cmshow;
      obj.loweval = function(){
        wbip.vars.gGraph.selectAll("*:not(.background)").remove();
        eval(obj.low.getValue());
      };
    };
    
  obj.init =
    function(){
      obj.defaults(wbip.vars.svg);
    };
  
  // ----
  // Utils
  obj.lastempty =
    // given a CodeMirror variable
    // and a line number
    // return the last empty line going backwards
    function(cmvar, lineN){
      while(cmvar.getLine(lineN - 1) === "")
        lineN -= 1;
      return lineN;
    }
  
  obj.findbymarker =
    // Given a CodeMirror variable
    // and two markers = [start, end]
    // Find the region that exists between the two markers
    // Returning it as a {from, to} object
    // Specifically, the region starting just after the
    // "// MARKER start" line, and
    // ending just before the next "// MARKER end" (or the end of the doc)
    function(cmvar, marker){
      var LineAfter = function(pos){return {line: pos.line + 1, ch: 0};};
      var searchStartMark = cmvar.getSearchCursor("// MARKER " + marker[0]);
      searchStartMark.findNext();
      var startpos = LineAfter(searchStartMark.pos.to);
      var searchEndMark = cmvar.getSearchCursor("// MARKER " + marker[1], pos = startpos);
      searchEndMark.findNext();
      var endpos = {line: obj.lastempty(cmvar, searchEndMark.pos.from.line - 1)};
      return {from: startpos, to: endpos};
    };
  
  obj.findbyid =
    // Given a CodeMirror variable
    // and an ID
    // Find the region that applies to the ID
    // Returning it as a {from, to} object
    // Specifically, the region starting just after the
    // "// MARKER curID" line, and
    // ending just before the next "// MARKER" (or the end of the doc)
    function(cmvar, curID){
      return obj.findbymarker(cmvar, [curID, ""]);
    };
  
  obj.highlight =
    // Given a CodeMirror variable
    // and an ID
    // Mark and highlight the code relating to the ID
    // Return the mark variable
    function(cmvar, curID){
      var fromto = obj.findbyid(cmvar, curID);
      var mark = cmvar.markText(from = fromto.from, to = fromto.to,
        options = {className: "cm-selected", inclusiveRight: true});
      return mark;
    };
  
  obj.searchbetween =
    // Given a CodeMirror variable
    // Text to search for
    // And a {from, to} object
    // See if the text can be found (uniquely) in that region
    // Specifically, it searches twice:
    // 1) After "from"
    // 2) Before "to"
    // If both return the same result, return the pos
    // Else return false
    function(cmvar, query, fromto){
      var searchStartMark = cmvar.getSearchCursor(query, pos = fromto.from);
      searchStartMark.findNext();
      var searchEndMark = cmvar.getSearchCursor(query, pos = fromto.to);
      searchEndMark.findPrevious();
      return searchStartMark.pos.from.line === searchEndMark.pos.to.line ? searchStartMark.pos : false;
    };
  
  obj.replaceline =
    // Search for the line containing searchstr (within fromto)
    // and replace the entire line with newline
    function(cmvar, fromto, searchstr, newline){
      var searchres = obj.searchbetween(cmvar, searchstr, fromto);
      var repfromto = {from: {line: searchres.from.line, ch: 0}, to: {line: searchres.from.line}};
      cmvar.replaceRange(newline, from = repfromto.from, to = repfromto.to);
    };
  
  return obj;
}();
// wbip.cm.new(wbip.vars.svg, "testcm", [500, 400], [100, 100])
