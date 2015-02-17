wbip.btnintf = function(){
  var obj = {tags: "intf-template", requires: ["cm", "ffw"]};
  
  obj.new =
    function(gMenu, curID, returnfunc, cancelfunc, evalfunc,
             layout, btndef, btnadds, btndim, padding, transxy){
      btnadds = wbip.defarg(btnadds, true);
      btndim = wbip.defarg(btndim, [20, 20]);
      padding = wbip.defarg(padding, 5);
      transxy = wbip.defarg(transxy, [360, 160]);
      
      // Compute dim
      var dim = [layout[0] * (btndim[0] + padding) + padding,
                 (layout[1] + 2) * (btndim[1] + padding) + padding];
      var xpos = wbip.utils.seq(padding, dim[0], layout[0] + 1);
      var ypos = wbip.utils.seq((btndim[1] + padding) * 2 + padding, dim[1], layout[1] + 1);
      var ffw = wbip.ffw.new(gMenu, curID, dim, transxy);
      ffw.classed("wbip-valintf-btnintf", true);
      
      // Adjust ffw exit button
      var ffouter = d3.select(ffw[0][0].parentNode);
      ffouter.select(".wbip-ffw-bar-rem")
        .on("click", function(){
          cancelfunc();
          ffouter.remove();
        });
      
      // Draw CM
      var cmdim = [xpos[xpos.length - 2] - padding * 2, btndim[1] * 2 + padding]
      ffw.append("foreignObject")
        .attr("x", xpos[0])
        .attr("y", padding)
        .attr("width", cmdim[0])
        .attr("height", cmdim[1])
        .append("xhtml:body").append("div")
          .attr("id", curID + "-cm");
      
      cmvar = CodeMirror(document.getElementById(curID + "-cm"), {
        mode:  "javascript",
        firstLineNumber: 0,
        tabSize: 2,
        matchBrackets: true,
        highlightSelectionMatches: true
      });
      cmvar.setSize(width = cmdim[0], height = cmdim[1]);
      
      // Draw eval-ok button
      var evalokbtn = wbip.utils.button(ffw, curID + "-evalok",
        [xpos[layout[0] - 1], padding], btndim, undefined,
        "Indicates whether the expression is valid");
      var evalokbg = evalokbtn.select("rect.wbip-button-bg");
      var lastevalok = cmvar.getValue();
      evalokbg.style("fill", "green");
      
      // Setup eval check
      cmvar.on("change", function(){
        try{
          var cureval = evalfunc(cmvar.getValue().replace("\n", "", "g"));
          wbip.outcode.freeze = true;
          returnfunc(cureval);
          wbip.outcode.freeze = false;
          lastevalok = cureval;
          evalokbg.style("fill", "green");
        } catch(e){
          evalokbg.style("fill", "red");
        }
      });
      
      // Draw buttons
      var gbtns = ffw.append("g")
        .attr("id", curID + "-gbtns");
      for(var i = 0; i < layout[1]; i++){
        for(var j = 0; j < layout[0]; j++){
          var curdef = btndef[i][j];
          if(curdef !== undefined){
            if(typeof(curdef) === "object"){
              // If an object, need to grab the defines and draw properly
              var curbtndim = btndim.slice(0);
              if(curdef.width !== undefined){
                curbtndim[0] += (curdef.width - 1) * (btndim[0] + padding);
              }
              if(curdef.height !== undefined){
                curbtndim[1] += (curdef.height - 1) * (btndim[1] + padding);
              }
              wbip.utils.button(gbtns, undefined, [xpos[j], ypos[i]],
                curbtndim, curdef.label, curdef.tooltip, curdef.styles);
              
            } else{
              // Else just a simple label
              wbip.utils.button(gbtns, undefined,
                [xpos[j], ypos[i]], btndim, curdef);
            }
          }
        }
      }
      // Bind events to buttons
      var onclick = function(){
        var tarbtn = wbip.utils.getParent(d3.event.target, "wbip-button");
        var tarval = d3.select(tarbtn).select("text").text();
        switch(tarval){
          case "SET":
            returnfunc(lastevalok);
            ffouter.remove();
            break;
          default:
            if(btnadds === true){
              cmvar.replaceRange(tarval, cmvar.getCursor());
            } else{
              cmvar.setValue(tarval);
            }
        }
      };
      gbtns.on("click", onclick);
      
      // Focus cmvar
      cmvar.focus();
      
      return ffw;
    };
  
  return obj;
}();