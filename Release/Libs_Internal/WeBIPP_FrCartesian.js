wbip.frcart = function(){
  var obj = {tags: "frame", type: "primary"};
  
  obj.icon =
    function(gMenu, transXY){
      obj.gMenu = gMenu;
      var curdefs = gMenu.select("defs");
      var curS = wbip.icon.def(gMenu, "wbip-icon-frcart");
      curS.append("line")
        .attr("x1", 0)
        .attr("y1", 15)
        .attr("x2", 20)
        .attr("y2", 15);
      curS.append("line")
        .attr("x1", 5)
        .attr("y1", 20)
        .attr("x2", 5)
        .attr("y2", 0);
      curS.append("rect")
        .attr("width", 20)
        .attr("height", 20);
      
      var curG = gMenu.append("g")
        .attr("transform", wbip.utils.translate(transXY))
        .classed("wbip-icon-frcart", true);
      wbip.icon.use(curG, "wbip-icon-frcart");
      
      curG.on("click", function(){
        wbip.gGraph.iconclick("frcart", gMenu, transXY);
      });
    };
  
  obj.defs = {
    x: ["special", "scale", {
      name: ["special", "string"],
      domain: ["special", "domain"],
      range: ["special", "range"]
    }],
    y: ["special", "scale", {
      name: ["special", "string"],
      domain: ["special", "domain"],
      range: ["special", "range"]
    }],
    axes: ["special", "axes", {
      opts: ["special", "axes-opts"]
    }],
    dim: ["special", "dim"],
    transform: ["special", "transform"]
  };
  
  obj.setattr =
    function(curID, name, val){
      var curVars = wbip.getIDvar(curID);
      var updateScale =
        function(ScaleName){
          // If scale is x, range maps to width (dim[0])
          // else it's y, and range maps to height (dim[1])
          if(ScaleName === "x"){
            var rangemap = curVars.attr.dim[0];
          } else{
            var rangemap = curVars.attr.dim[1];
          }
          var valType = typeof curVars.attr[ScaleName + "-domain"][0];
          switch(valType){
            case "number":
              curVars.attr[ScaleName] = d3.scale.linear()
                .domain(curVars.attr[ScaleName + "-domain"])
                .range(curVars.attr[ScaleName + "-range"]
                  .map(function(x) {return x * rangemap;}));
              break;
            case "string":
              curVars.attr[ScaleName] = d3.scale.ordinal()
                .domain(curVars.attr[ScaleName + "-domain"])
                .rangePoints(curVars.attr[ScaleName + "-range"]
                  .map(function(x) {return x * rangemap;}), 1);
              break;
          }
          
          wbip.cm.loweval();
        };
      switch(name){
        case "x":
        case "y":
          // Only accepts wbip.data inputs
          if(val.substr(0, 9) === "wbip.data"){
            curVars.attr[name + "-name"] = val.replace(/(.+)\[\"(.+)\"\]/, "$2");
            val = eval(val);
            var valType = typeof val[0];
            switch(valType){
              case "number":
                curVars.attr[name + "-domain"] = d3.extent(val);
                break;
              case "string":
                curVars.attr[name + "-domain"] = val;
                break;
            }
            updateScale(name);
          }
          break;
        case "x-name":
          curVars.attr[name] = val;
          updateScale("x");
          break;
        case "y-name":
          curVars.attr[name] = val;
          updateScale("y");
          break;
        case "x-domain":
        case "x-range":
          val = eval(val);
          curVars.attr[name] = val;
          updateScale("x");
          break;
        case "y-domain":
        case "y-range":
          val = eval(val);
          curVars.attr[name] = val;
          updateScale("y");
          break;
        case "axes":
          val = eval(val);
          if(!wbip.utils.isArray(val)){val = [val];}
          curVars.attr[name] = val;
          var fromto = wbip.cm.findbyid(wbip.cm.low, curID);
          var searchstr = 'wbip.frcart.axes(curG, ';
          var newval = searchstr + JSON.stringify(val) + ");";
          wbip.cm.replaceline(wbip.cm.low, fromto, searchstr, newval);
          wbip.cm.loweval();
          break;
        case "axes-opts":
          // TODO
          val = JSON.parse(val);
          curVars.attr[name] = val;
          wbip.cm.loweval();
          break;
        case "dim":
          val = eval(val);
          curVars.attr[name] = val;
          var fromto = wbip.cm.findbyid(wbip.cm.low, curID);
          var searchstr = '.attr("width"';
          var newval = "  " + searchstr + ", " + JSON.stringify(val[0]) + ")";
          wbip.cm.replaceline(wbip.cm.low, fromto, searchstr, newval);
          var searchstr = '.attr("height"';
          var newval = "  " + searchstr + ", " + JSON.stringify(val[1]) + ")";
          wbip.cm.replaceline(wbip.cm.low, fromto, searchstr, newval);
          updateScale("x");
          updateScale("y");
          break;
        case "transform":
          val = eval(val);
          curVars.attr[name] = val;
          var fromto = wbip.cm.findbyid(wbip.cm.low, curID);
          var searchstr = 'curG.attr("transform"';
          var newval = searchstr + ", " + "wbip.utils.translate(" + JSON.stringify(val) + "));";
          wbip.cm.replaceline(wbip.cm.low, fromto, searchstr, newval);
          wbip.cm.loweval();
          break;
        default:
          // FrCart should never be calling generic setattr
          wbip.setattr(curID, obj.defs[name], name, val);
      }
    };
  
  obj.getattr = 
    function(curID, name){
      // for x and y, construct something meaningful
      //   using domain and range.
      switch(name){
        case "x":
          return JSON.stringify(wbip.getattr(curID, "x-domain")) +
            " -> " + JSON.stringify(wbip.getattr(curID, "x-range"));
        case "y":
          return JSON.stringify(wbip.getattr(curID, "y-domain")) +
            " -> " + JSON.stringify(wbip.getattr(curID, "y-range"));
        default:
          var curval = wbip.getattr(curID, name);
          if(typeof curval !== "string"){curval = JSON.stringify(curval);}
          return curval;
      }
    };
  
  obj.click =
    function(curID, curFrame, Coords){
      var outcode = wbip.outcode.init(curID, curFrame,
        {"wbip-frame": true, "wbip-obj-frcart": true, "wbip-gobj": true});
      var ParentVars = wbip.getIDvar(curFrame.attr("id"));
      var transxy = [80, 80];
      var dim = [ParentVars.attr.dim[0] - transxy[0] * 2, ParentVars.attr.dim[1] - transxy[1] * 2];
      var curAttrs = {
        dim: dim,
        transform: transxy,
        x: d3.scale.linear().domain([0, 1]).range([0, dim[0]]),
        "x-name": "[0, 1]",
        "x-domain": [0, 1],
        "x-range": [0.05, 0.95],
        y: d3.scale.linear().domain([0, 1]).range([dim[1], 0]),
        "y-name": "[0, 1]",
        "y-domain": [0, 1],
        "y-range": [0.95, 0.05],
        axes: [1, 2],
      };
      var curVars = {attr: curAttrs, name: "frcart"};
      wbip.setIDvar(curID, curVars);
      
      outcode += wbip.outcode.append(1, "rect",
        {width: dim[0], height: dim[1]}, {background: true});
      
      outcode += 'wbip.frcart.axes(curG, [1, 2]);\n';
      
      outcode += 'curG.attr("transform", wbip.utils.translate(' + JSON.stringify(transxy) + '));\n\n';
      
      wbip.outcode.write(outcode, "low");
      eval(outcode);
      
      wbip.slidemenu.append(d3.select("g.wbip-sm-" + curFrame.attr("id")),
        [{text: curID, icon: "wbip-icon-frcart", canmm: true}]);
    };
  
  obj.axes =
    // Given the frame <g> selection
    // the axes to draw (1-4, for BLTR)
    // Attach axes to the frame
    function(curG, axes){
      var useopts =
        // Taking in the full opts
        // Check for any opts defined in "all" and apply first
        // Then check for any opts defined for this specific "axis" and apply
        function(curaxis, axis, opts){
          var applyopts =
            function(subopts, curopt){
              var val = subopts[curopt];
              // Try to eval val to see if it's a normal string
              // Or some kind of expression
              try{
                var valreal = eval(val);
              } catch(e){
                val = JSON.stringify(val);
              }
              return outcode = "curaxis." + curopt + "(" + val + ")";
            };
          if(opts !== undefined){
            if(opts["all"] !== undefined){
              var subopts = opts["all"];
              for(var curopt in subopts){
                eval(applyopts(subopts, curopt));
              }
            }
            if(opts[axis] !== undefined){
              var subopts = opts[axis];
              for(var curopt in subopts){
                eval(applyopts(subopts, curopt));
              }
            }
          }
        };
      var curAttrs = wbip.getIDvar(curG.attr("id")).attr;
      var opts = curAttrs["axes-opts"];
      //if(wbip.utils.contains(axes, "any", [1, "1", "b", "B", "bottom", "Bottom"])){
      if(wbip.utils.contains(axes, "any", 1)){
        var curaxis = d3.svg.axis()
          .scale(curAttrs.x)
          .tickPadding(10)
          .orient("bottom");
        useopts(curaxis, "1", opts);
        var axisG = curG.append("g")
          .classed({"wbip-axis": true, "wbip-axis-1": true})
          .attr("transform", wbip.utils.translate(0, curAttrs.dim[1]))
          .call(curaxis);
        var axisBBox = axisG[0][0].getBBox();
        var labelpos = [axisBBox.x + axisBBox.width/2, axisBBox.y + axisBBox.height + 20];
        curG.append("g")
          .classed({"wbip-axis-label": true, "wbip-axis-1": true})
          .attr("transform", wbip.utils.translate(0, curAttrs.dim[1]))
          .append("text")
            .attr("x", labelpos[0])
            .attr("y", labelpos[1])
            .text(curAttrs["x-name"]);
      }
      if(wbip.utils.contains(axes, "any", 2)){
        var curaxis = d3.svg.axis()
          .scale(curAttrs.y)
          .tickPadding(10)
          .orient("left");
        useopts(curaxis, "2", opts);
        var axisG = curG.append("g")
          .classed({"wbip-axis": true, "wbip-axis-2": true})
          .call(curaxis);
        var axisBBox = axisG[0][0].getBBox();
        var labelpos = [axisBBox.x - 20, axisBBox.y + axisBBox.height/2];
        curG.append("g")
          .classed({"wbip-axis-label": true, "wbip-axis-2": true})
          .append("text")
            .attr("transform", "rotate(270 " + labelpos[0] + "," + labelpos[1] + ")")
            .attr("x", labelpos[0])
            .attr("y", labelpos[1])
            .text(curAttrs["y-name"]);
      }
      if(wbip.utils.contains(axes, "any", 3)){
        var curaxis = d3.svg.axis()
          .scale(curAttrs.x)
          .tickPadding(10)
          .orient("top");
        useopts(curaxis, "3", opts);
        var axisG = curG.append("g")
          .classed({"wbip-axis": true, "wbip-axis-3": true})
          .call(curaxis);
        var axisBBox = axisG[0][0].getBBox();
        var labelpos = [axisBBox.x + axisBBox.width/2, axisBBox.y - 20];
        curG.append("g")
          .classed({"wbip-axis-label": true, "wbip-axis-3": true})
          .append("text")
            .attr("x", labelpos[0])
            .attr("y", labelpos[1])
            .text(curAttrs["x-name"]);
      }
      if(wbip.utils.contains(axes, "any", 4)){
        var curaxis = d3.svg.axis()
          .scale(curAttrs.y)
          .tickPadding(10)
          .orient("right");
        useopts(curaxis, "4", opts);
        var axisG = curG.append("g")
          .classed({"wbip-axis": true, "wbip-axis-4": true})
          .attr("transform", wbip.utils.translate(curAttrs.dim[0], 0))
          .call(curaxis);
        var axisBBox = axisG[0][0].getBBox();
        var labelpos = [axisBBox.x + axisBBox.width + 20, axisBBox.y + axisBBox.height/2];
        curG.append("g")
          .classed({"wbip-axis-label": true, "wbip-axis-4": true})
          .attr("transform", wbip.utils.translate(curAttrs.dim[0], 0))
          .append("text")
            .attr("transform", "rotate(270 " + labelpos[0] + "," + labelpos[1] + ")")
            .attr("x", labelpos[0])
            .attr("y", labelpos[1])
            .text(curAttrs["y-name"]);
      }
    }
  
  return obj;
}();

wbip.addon("frcart");
