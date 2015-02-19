wbip.dataviewer = function(){
  var obj = {tags: "ffw", type: "tertiary", requires: ["slidemenu"]};
  var utils = wbip.utils;
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curS = wbip.icon.def(gMenu, "wbip-icon-dataviewer");
      curS.append("text")
        .attr("x", 10)
        .attr("y", 10)
        .text("D");
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", utils.translate(transXY))
        .classed("wbip-icon-dataviewer", true);
      wbip.icon.use(curG, "wbip-icon-dataviewer");
      
      curG.on("click", function(){
        if(d3.select("#wbip-dataviewer").empty()){
          obj.new(wbip.vars.svg, "wbip-dataviewer", [300, 100]);
        }
      });
    };
  
  obj.new =
    function(gMenu, curID, transxy = [0, 0]){
      var dim = [0, 0];
      var ffw = wbip.ffw.new(gMenu, curID, dim, transxy);
      
      // ----
      // data list
      // compile the slidemenu childrens array
      var smchildren = [];
      var fulldat = wbip.data;
      for(var curdat in fulldat){
        var curchild = utils.names(fulldat[curdat]);
        var cursmchildren = [];
        for(var i = 0; i < curchild.length; i++){
          cursmchildren.push({text: curchild[i]});
        }
        smchildren.push({
          text: curdat, canmm: true,
          children: cursmchildren
        })
      }
      // append the slidemenu
      var curG = ffw.append("g")
        .attr("id", curID + "-dlist")
        .classed("wbip-dataviewer-dlist", true);
      var smg = wbip.slidemenu.new(curG, curID + "-dlist-sm", null, bg = false,
        events = {
          click: function(){
            if(typeof obj.click === "function"){
              obj.click(d3.select(this));
            }
            d3.event.stopPropagation();
          },
          "click.draw": function(){
            // If a parent is clicked, draw the data table
            var curIDvar = wbip.getIDvar(this.id);
            if(curIDvar.parent === curIDvar.gparent){
              if(d3.select("#wbip-datatable").empty()){
                obj.datadraw(fulldat[d3.select(this).select("text").text()]);
              }
            }
          },
          mouseover: function(){
            wbip.slidemenu.drawBBox(d3.select(this)).classed("wbip-dataviewer-dlist-BBox", true);
            d3.event.stopPropagation();
          },
          mouseout: function(){
            d3.selectAll(".wbip-dataviewer-dlist-BBox").remove();
            d3.event.stopPropagation();
          }
        });
      wbip.slidemenu.append(smg, smchildren);
      
      // data draw
      // TODO
      
      // Adjust dim
      var adjdim = function(){
        dim = wbip.getIDvar(smg.attr("id")).dim;
        wbip.ffw.dim(ffw, dim);
      };
      adjdim();
      // Attach events to adjust dim as minmax buttons are used
      smg.selectAll("use.wbip-slidemenu-mmuse").on("click.dim", adjdim);
    };
  
  obj.datadraw =
    // Draws the data table for the selected data
    function(dat){
      // Open a ffw html, and append a table
      var curID = "wbip-datatable";
      var dim = [600, 600];
      var transxy = [100, 110];
      // Compute dim width from dat length
      // Limited by interface width
      var names = utils.names(dat);
      dim[0] = Math.min(120 * (1 + names.length), wbip.layout.dim[0] - 70);
      
      var ffw = wbip.ffw.new(wbip.vars.svg, curID + "-ffw", dim, transxy);
      var fO = ffw.append("foreignObject")
        .attr("width", dim[0])
        .attr("height", dim[1]);
      var table = fO.append("xhtml:body")
          .style("margin", "5px")
          .append("table")
          .attr("id", curID)
          .attr("width", "100%");
      
      // Populate table from data
      var trimval =
        // trims the value provided to a set number of characters
        function(val){
          var maxchar = 26;
          if(val.length > maxchar){
            var val = val.substr(0, maxchar - 3) + "...";
          }
          return val;
        };
      // Header
      var currow = table.append("thead").append("tr");
      currow.selectAll("th").data(["n"].concat(names)).enter()
        .append("th").html(trimval);
      // Data
      var nrow = utils.nrow(dat);
      if(utils.isArray(nrow)){return;}
      var tbody = table.append("tbody");
      for(var i = 0; i < nrow; i++){
        var curdat = utils.getrow(dat, i);
        var currow = tbody.append("tr");
        currow.selectAll("th").data([i + 1].concat(curdat)).enter()
          .append("th").html(trimval);
      }
      
      // Resize (height) appropriately
      var ffwresize = function(){
        var tablebbox = fO.select("#" + curID + "_wrapper")[0][0].getBoundingClientRect();
        dim[1] = tablebbox.height + 10;
        wbip.ffw.dim(ffw, dim);
        fO.attr("height", dim[1]);
      }
      
      // Call jQuery-DataTable
      $('#' + curID).DataTable({
        lengthChange: false,
        searching: false,
        scrollX: true,
        columnDefs: [{
         targets: "_all",
         width: "120px"
        }],
        pagingType: "full",
        drawCallback: ffwresize
      });
    };
  
  return obj;
}();
wbip.addon("dataviewer");
