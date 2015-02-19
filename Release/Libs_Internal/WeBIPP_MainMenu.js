wbip.mainmenu = function(){
  var obj = {tags: "mainmenu", type: "tertiary", requires: ["slidemenu"]};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-mainmenu");
      curS.append("text")
        .attr("x", 10)
        .attr("y", 10)
        .text("M");
        //.attr("transform", "rotate(-45 10 10)")
        //.text("wbip");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-mainmenu", true);
      wbip.icon.use(curG, "wbip-icon-mainmenu");
      
      curG.on("click", function(){
        if(d3.select("#wbip-mainmenu").empty()){
          var smp = wbip.slidemenu.new(gMenu, "wbip-mainmenu", null, bg = true,
            events = {
              click: obj.dispatch,
              mouseover: function(){
                wbip.slidemenu.drawBBox(d3.select(this)).classed("wbip-mainmenu-sm-BBox", true);
                d3.event.stopPropagation();
              },
              mouseout: function(){
                d3.selectAll(".wbip-mainmenu-sm-BBox").remove();
                d3.event.stopPropagation();
              }
            }, canmm = false
          );
          smp.attr("transform", wbip.utils.translate(d3.mouse(gMenu[0][0]).map(function(x){return x + 10;})));
          var smc = [
            {text: "Undo"}, {text: "Resize"},
            {text: "New"}, {text: "Save"}, {text: "Load"},
            {text: "Read JSON Data"}, {text: "Read CSV Data"},
            {text: "Re-run Code"},
            {text: "Code-WeBIPP"}, {text: "Code-D3js"},
            {text: "Add Marker"}, {text: "Functionise Actions"}
          ];
          wbip.slidemenu.append(smp, smc);
        } else{
          d3.select("#wbip-mainmenu").remove();
        }
      });
    };
  
  obj.dispatch =
    function(){
      var curopt = d3.select(this).select("text").text();
      
      switch(curopt){
        case "New":
          wbip.new();
          break;
        case "Undo":
          wbip.outcode.undo();
          break;
        case "Resize":
          wbip.layout.resize();
          break;
        case "Save":
          obj.save();
          break;
        case "Load":
          d3.select("#load-div").select("input")[0][0].click();
          break;
        case "Read JSON Data":
          d3.select("#read-div").select("input")[0][0].click();
          break;
        case "Read CSV Data":
          d3.select("#readcsv-div").select("input")[0][0].click();
          break;
        case "Re-run Code":
          wbip.data = {};
          wbip.vars.ELIndex = undefined;
          wbip.cm.higheval();
          break;
        case "Code-WeBIPP":
          wbip.cm.highshow();
          break;
        case "Code-D3js":
          wbip.cm.lowshow();
          break;
        case "Add Marker":
          wbip.fise.addmarker();
          break;
        case "Functionise Actions":
          wbip.fise.newUI();
          break;
      }
      
      d3.select("#wbip-mainmenu").remove();
      d3.event.stopPropagation();
    };
  
  obj.save =
    function(){
      var header = {
        version: wbip.version,
        addonList: wbip.addonList,
        dim: wbip.layout.dim,
        ELIndex: wbip.vars.ELIndex
      };
      var content = "/*WBIP SAVE HEADER" +
        JSON.stringify(header, null, 2) +
        "END*/\n"
      content += wbip.cm.high.getValue();
      var uriContent = "data:text/plain," + encodeURIComponent(content);
      window.open(uriContent, 'wbip-code-save');
    };
  
  return obj;
}();
wbip.addon("mainmenu");
