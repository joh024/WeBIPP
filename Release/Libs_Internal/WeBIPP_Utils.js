wbip.utils = function(){
  var obj = {tags: "utils"};
  
  obj.isArray =
    function(obj){
      return Object.prototype.toString.call(obj) === "[object Array]";
    };
  
  obj.transpose =
    // Transpose a "matrix" (2d array)
    // For improper cases of unequal ncol
    //   ncol of the first row is taken to be definitive
    //   If ncol is shorter than the def, it's filled with undefined
    //   If ncol is longer than the def, the excess is discarded
    function(mat){
      return mat[0].map(function(x, j){
        return mat.map(function(y, i){
          return y[j];
        })
      });
    }
  
  obj.contains =
    // Check if array contains any/all of
    // the specified values
    function(arr, anyall, vals){
      if(!obj.isArray(vals)){vals = [vals];}
      switch(anyall){
        case "any":
          for(var i = 0; i < vals.length; i++){
            if(arr.indexOf(vals[i]) > -1){
              return true;
            }
          }
          return false;
          break;
        case "all":
          for(var i = 0; i < vals.length; i++){
            if(arr.indexOf(vals[i]) === -1){
              return false;
            }
          }
          return true;
          break;
      }
    };
  
  obj.names =
    // function for obtaining the equivalent to
    //   "names(vector)" in R
    // Alternative method: return Object.keys(vec);
    // Test performance sometime
    function(vec){
      var names = new Array;
      for(var curname in vec){names.push(curname);}
      return names;
    };
  
  obj.nrow =
    // for each 'column' of the data
    // compute nrow
    // return a single number if all nrow the same
    // else return an array of all the nrows
    function(dat){
      var nrows = [];
      for(var name in dat){
        nrows.push(dat[name].length);
      }
      
      var firstn = nrows[0];
      for(var i = 1; i < nrows.length; i++){
        if(nrows[i] !== firstn){
          return nrows;
        }
      }
      
      return firstn;
    };
  
  obj.getrow =
    // get the nth row of dat
    function(dat, n){
      var row = [];
      for(var name in dat){
        row.push(dat[name][n]);
      }
      return row;
    };
  
  obj.maxnchar =
    // function for obtaining the equivalent to
    //   "max(nchar(vector))" in R
    function(vec){
      var nchar = 0;
      var len;
      
      // coerce to an array if (most likely) a scalar
      if(typeof vec != "object"){vec = [vec];}
      
      for(var i = 0; i < vec.length; i++){
        len = String(vec[i]).length
        nchar = len > nchar ? len : nchar
      }
      
      return nchar;
    };
  
  obj.cumsum =
    function(vec){
      var outvec = [vec[0]];
      for(var i = 1; i < vec.length; i++){
        outvec[i] = outvec[i - 1] + vec[i];
      }
      return outvec;
    };
  
  obj.seq =
    // Produces a linear sequence of numbers
    function(from, to, length){
      var incr = (to - from)/(length - 1);
      var curval = from;
      var out = [];
      for(var i = 0; i < length; i++){
        out.push(curval);
        curval += incr;
      }
      return out;
    };
  
  obj.scalebetween =
    // Scales values in array x linearly
    // such that the new [min, max] are [from, to]
    function(x, from, to){
      var range = d3.extent(x);
      var sfactor = (to - from)/(range[1] - range[0]);
      
      var out = [];
      for(var i = 0; i < x.length; i++){
        out.push((x[i] - range[0]) * sfactor + from);
      }
      return out;
    }
  
  obj.translate =
    // Accepts either 2 numbers, or 
    //   1 argument which is an array of length 2
    // Constructs the string: "translate(arg1,arg2)"
    function(){
      if(arguments.length == 1){
        out = "translate(" + arguments[0][0] + "," + arguments[0][1] + ")";
      } else{
        out = "translate(" + arguments[0] + "," + arguments[1] + ")";
      }
      return out;
    };
  
  obj.addtransform =
    // Given a d3 selection and a transformation
    // Append new transformation to existing
    // Or if no existing, then just add new transform
    // Return new transform string
    function(sel, transf){
      var oriTransform = sel.attr("transform");
      oriTransform = !oriTransform ? "" : oriTransform + " ";
      sel.attr("transform", oriTransform + transf);
      return oriTransform + transf;
    };
  
  obj.coords =
    // Accepts 2 arrays giving x and y coords
    // Pastes them together to create SVG-compatible coords
    // e.g. x = [1, 2, 3], y = [5, 6, 7]
    // becomes "1,5 2,6 3,7"
    // Where lengths of x and y differ, the longer array
    //   is truncated without warning
    function(x, y){
      var out = "";
      for(var i = 0; i < Math.min(x.length, y.length); i++){
        out += " " + x[i] + "," + y[i];
      }
      return out;
    };
  
  obj.dragevt =
    // Bind a drag event on the d3 selection "selevt"
    // that transforms (or drags) the d3 selection "seldrag"
    // Optionally, specify any initial transform x/y
    // Optionally, specify bounding values of x/y in the form:
    //   [xmin, xmax, ymin, ymax]
    // Doesn't work very well if selevt is a child of seldrag
    //   as transforms on seldrag affect the origin
    function(selevt, seldrag, initxy, boundxy){
      initxy = wbip.defarg(initxy, [0, 0]);
      var dragmove = function(){
        initxy[0] += d3.event.dx;
        initxy[1] += d3.event.dy;
        if(boundxy !== undefined){
          initxy[0] = Math.min(Math.max(initxy[0], boundxy[0]), boundxy[1]);
          initxy[1] = Math.min(Math.max(initxy[1], boundxy[2]), boundxy[3]);
        }
        seldrag.attr("transform", obj.translate(initxy));
      }
      var drag = d3.behavior.drag()
          .origin(Object)
          .on("drag", dragmove);
      selevt.call(drag);
    };
  
  obj.resize =
    // Create a resize helper for the selected object
    // onresize - called as the resize occurs
    // cancel - if user exits, how to clean-up and revert resize
    // returnfunc - if anything special needs to happen to "save" the resize
    function(sel, curdim, drag, dragend, cancelfunc, returnfunc, donglesize){
      donglesize = wbip.defarg(donglesize, 20);
      var dragobj = sel.append("g")
        .attr("transform", obj.translate(curdim))
        .classed("wbip-resize", true);
      dragobj.append("circle")
        .attr("r", donglesize);
      dragobj.append("path")
        .attr("d", "M -0.5,0 V -" + curdim[1]/3 + " M -0.5,-0.5 H -" + curdim[0]/3);
      // dim text
      dragobj.append("rect")
        .classed("wbip-resize-text-bg", true);
      var dimtext = dragobj.append("text")
        .attr("x", -7)
        .attr("y", -27)
        .classed("wbip-resize-text", true)
        .on("mousedown.drag", function(){d3.event.stopPropagation();});
      dragobj.append("rect")
        .classed({"wbip-fg": true, "wbip-resize-text-fg": true});
      var resizetext = function(){
        dimtext.text(curdim[0] + "," + curdim[1]);
        var textbbox = dimtext[0][0].getBBox();
        dragobj.select("rect.wbip-resize-text-bg")
          .attr("x", textbbox.x - 2)
          .attr("y", textbbox.y - 2)
          .attr("width", textbbox.width + 4)
          .attr("height", textbbox.height + 4);
        dragobj.select("rect.wbip-resize-text-fg")
          .attr("x", textbbox.x - 2)
          .attr("y", textbbox.y - 2)
          .attr("width", textbbox.width + 4)
          .attr("height", textbbox.height + 4);
      }
      resizetext();
      // ok/cancel
      dragobj.append("rect")
        .attr("x", -(20 + 50))
        .attr("y", -20)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "green")
        .classed("wbip-resize-ok", true)
        .on("mousedown.drag", function(){d3.event.stopPropagation();})
        .on("click", function(){
          returnfunc(curdim);
          dragobj.remove();
        });
      dragobj.append("rect")
        .attr("x", -(20 + 25))
        .attr("y", -20)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "red")
        .classed("wbip-resize-cancel", true)
        .on("mousedown.drag", function(){d3.event.stopPropagation();})
        .on("click", function(){
          cancelfunc(curdim);
          dragobj.remove();
        });
      
      var ondrag = function(){
        curdim[0] += d3.event.dx
        curdim[1] += d3.event.dy
        drag(curdim);
        dragobj.attr("transform", obj.translate(curdim));
        resizetext();
      };
      var ondragend = function(){
        dragend(curdim);
      };
      var calldrag = d3.behavior.drag()
        .origin(Object)
        .on("drag", ondrag)
        .on("dragend", ondragend);
      dragobj.call(calldrag);
      
      return dragobj;
    };
  
  obj.helperline =
    // Create a helper line used to easily input numeric values
    // Supports arbitrary domain (range of values to input)
    // across an arbitrary width.
    // Can also specify number of tick marks.
    // The returnfunc is called every time the value changes
    //  given a single argument, being the value on the line
    function(gMenu, curID, domain, initval, width, transxy,
             returnfunc, round, ticks){
      round = wbip.defarg(round, 2);
      ticks = wbip.defarg(ticks, 3);
      var range = [0, width];
      var curscale = d3.scale.linear().domain(domain).range(range);
      var curaxis = d3.svg.axis()
        .scale(curscale)
        .ticks(ticks)
        .innerTickSize(10)
        .outerTickSize(10)
        .tickPadding(15);
      var axisG = gMenu.append("g")
        .attr("id", curID)
        .classed({"wbip-helperline": true})
        .attr("transform", wbip.utils.translate(transxy))
        .call(curaxis);
      var setval = function(rawval){
        var scaledval = curscale.invert(rawval).toFixed(round);
        var boundedval = Math.min(Math.max(scaledval, domain[0]), domain[1]);
        dragobj.attr("cx", curscale(boundedval));
        returnfunc(boundedval.toString());
      }
      axisG.on("mousedown", function(){setval(d3.mouse(axisG[0][0])[0])});
      
      // Bind events to the ticks
      axisG.selectAll("g.tick")
        .on("mousedown", function(d){
          dragobj.attr("cx", curscale(d));
          returnfunc(d.toString());
          d3.event.stopPropagation();
        })
        // Adjust ticks to straddle line
        .select("line")
        .attr("y1", -10)
        .attr("y2", 20);
      // Move the ticks above the domain path-line
      var curticks = axisG.selectAll("g.tick")[0];
      for(var i = 0; i < curticks.length; i++){
        axisG[0][0].appendChild(curticks[i]);
      }
      
      // Append helper circle
      var dragfunc =
        function(){
          var newval = Number(dragobj.attr("cx")) + d3.event.dx;
          setval(newval);
          d3.event.sourceEvent.stopPropagation();
        };
      var curdrag =  d3.behavior.drag()
        .origin(Object)
        .on("drag", dragfunc);
      var dragobj = axisG.append("circle")
        .attr("cx", curscale(initval))
        .attr("cy", 5)
        .attr("r", 12);
      // Bind drag event to path itself, rather than to object
      axisG.select("path.domain").call(curdrag);
    };
  
  obj.helperlineffwold =
    // Creates a ffw containing helper line(s)
    //   Domains given as objects of form: {name: [min, max]}
    //     with name being the name assigned to each helper-line
    //     which are given ID <curID + name>, and given visible label
    // Along with a button that calls returnfunc with current val
    // And with the exit button calling cancelfunc in addition to
    //   its normal action of closing/removing the ffw
    function(gMenu, curID, domain, initvals, width, transxy,
             returnfunc, cancelfunc, round, ticks){
      round = wbip.defarg(round, 2);
      ticks = wbip.defarg(ticks, 3);
      // Compute dim based on number of helperlines
      var helpnames = obj.names(domain);
      var dim = [width + 80, 20 + 50 * helpnames.length];
      
      // Create interimfunc
      var valstore = initval;
      var interimfunc =
        function(newval){
          valstore = newval;
          wbip.outcode.freeze = true;
          returnfunc(newval);
          wbip.outcode.freeze = false;
        };
      
      // Create ffw
      var ffw = wbip.ffw.new(gMenu, curID, dim, transxy);
      // Adjust ffw exit button
      var ffouter = d3.select(ffw[0][0].parentNode);
      ffouter.select(".wbip-ffw-bar-rem")
        .on("click", function(){
          interimfunc(initval);
          ffouter.remove();
        });
      
      // Append helperlines
      for(var i = 0; i < helpnames.length; i++){
        var curname = helpnames[i];
        wbip.utils.helperline(ffw, curID + "-" + curname,
          domain[curname], initvals[curname],
          width, [20, 20 + i * 50], interimfunc);
      }
      
      // Add labels to helperlines
      
      // Add set button to helperlines
      ffw.append("rect")
        .attr("transform", obj.translate(20, 20))
        .attr("x", 320)
        .attr("y", 10)
        .attr("width", 30)
        .attr("height", 20)
        .classed("wbip-helperline-ffw-set", true)
        .on("click", function(){
          returnfunc(valstore);
          ffouter.remove();
        });
    };
  
  obj.helperlineffw =
    // Creates a ffw containing helper line(s)
    function(gMenu, curID, helpers, width, cancelfunc, transxy){
      transxy = wbip.defarg(transxy, [180, 160]);
      // Compute dim based on number of helperlines
      var helpnames = obj.names(helpers);
      var dim = [width + 80, 150];
      
      // Create ffw
      var ffw = wbip.ffw.new(gMenu, curID, dim, transxy);
      ffw.classed("unselectable", true);
      
      // Adjust ffw exit button
      var ffouter = d3.select(ffw[0][0].parentNode);
      ffouter.select(".wbip-ffw-bar-rem")
        .on("click", function(){
          cancelfunc();
          ffouter.remove();
        });
      
      // Function to set Type
      var setType =
        function(name){
          // Reset value
          cancelfunc();
          
          // Remove any existing helperlines
          ffw.selectAll("#" + curID + "-helperline").remove();
          
          // Make interimfunc
          var valstore = helpers[name].initval;
          var interimfunc =
            function(newval){
              valstore = newval;
              wbip.outcode.freeze = true;
              helpers[name].returnfunc(newval);
              wbip.outcode.freeze = false;
            };
          
          // Append helperline
          obj.helperline(ffw, curID + "-helperline",
            helpers[name].domain, helpers[name].initval,
            width, [40, 60], interimfunc);
          
          // Bind event to Set button 
          ffw.select("#" + curID + "-set")
            .on("click", function(){
              helpers[name].returnfunc(valstore);
              ffouter.remove();
            });
          
          // Set name to Type display
          ffw.select("#" + curID + "-type").select("text").text(name);
        };
      var menuType =
        function(){
          var makesmc =
            // Construct slidemenu-children array using helpnames
            function(){
              var smc = [];
              for(var i = 0; i < helpnames.length; i++){
                var cursmc = {text: helpnames[i]};
                smc.push(cursmc);
              }
              return smc;
            };
          var typeselect =
            function(){
              setType(d3.select(this).select("text").text());
              ffw.select("#" + curID + "-type-menu").remove();
              d3.event.stopPropagation();
            }
          if(ffw.select("#" + curID + "-type-menu").empty()){
            var smp = wbip.slidemenu.new(ffw, curID + "-type-menu", null, bg = true,
              events = {
                click: typeselect,
              mouseover: function(){
                wbip.slidemenu.drawBBox(d3.select(this)).classed("wbip-helperline-ffw-sm-BBox", true);
                d3.event.stopPropagation();
              },
              mouseout: function(){
                d3.selectAll(".wbip-helperline-ffw-sm-BBox").remove();
                d3.event.stopPropagation();
              }
            }, canmm = false);
            smp.attr("transform", wbip.utils.translate(d3.mouse(this)));
            wbip.slidemenu.append(smp, makesmc());
          }
        };
      
      // Add Type display
      var curG = ffw.append("g")
        .attr("transform", obj.translate(5, 5))
        .attr("id", curID + "-type")
        .classed("wbip-helperline-ffw-type", true);
      curG.append("rect")
        .attr("width", 140) // compute proper using CalVals
        .attr("height", 30);
      curG.append("text")
        .attr("x", 70) // compute proper using CalVals
        .attr("y", 15)
        .text("NO TYPE");
      // If more than 1 helper
      // Create slidemenu for selecting helper
      if(helpnames.length > 1){curG.on("click", menuType);}
      
      // Add Set button
      var curG = ffw.append("g")
        .attr("transform", obj.translate(dim[0] - 85, dim[1] - 35))
        .attr("id", curID + "-set")
        .classed("wbip-helperline-ffw-set", true);
      curG.append("rect")
        .attr("width", 80) // compute proper using CalVals
        .attr("height", 30);
      curG.append("text")
        .attr("x", 40) // compute proper using CalVals
        .attr("y", 15)
        .text("SET");
      
      // Select first item on slidemenu to create starting helperline
      setType(helpnames[0]);
    };
  obj.helperlinetest = function(){
    obj.helperlineffw(wbip.vars.svg, "test-helper", {
        proportion: {domain: [0, 1], initval: 1, returnfunc: console.log},
        log2: {domain: [-5, 5], initval: 0, returnfunc: function(newval){console.log(Math.pow(2,newval))}}
      }, 300, function(){console.log("cancel")})
  };
  
  obj.CalibrateText =
    // Calibration of text sizes for the given d3 selection
    // Returns an array of length 2
    // [0] = Width of a character (only applicable if using fixed-width font)
    // [1] = Height of a character
    // Automatically rounds up to the nearest integer to avoid
    //   anti-aliasing issues
    // Arguments:
    // CalSVG - a d3 selection, can be <svg> or <g>
    // CalStyles - a 2d array of n by 2
    //             specifying any style-attributes for the text
    //        e.g.   [["font-weight", "bold"]]
    //        e.g.2  [["font-weight", "bold"],
    //                ["font-style", "italic"]]
    function(CalSVG, CalStyles){
      var CalString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789 ";
      var CalLength = CalString.length;
      
      var CalTextNode = CalSVG.append("text").text(CalString);
      if(CalStyles != undefined)
        for(var i = 0; i < CalStyles.length; i++)
          CalTextNode.attr(CalStyles[i][0], CalStyles[i][1]);
      var CalBBox = CalTextNode[0][0].getBBox();
      var CalWidth = Math.ceil(CalBBox.width / CalLength);
      var CalHeight = Math.ceil(CalBBox.height);
      
      CalTextNode.remove();
      
      return [CalWidth, CalHeight];
    };

  obj.drawBBox =
    // Given an SVG element, draw the bounding box
    //   around said element using rect
    // rect takes default styles, so needs to be styled as required
    // Returns the d3 selection for the rect
    function(el){
      var curBBox = el.getBBox();
      var curTransform = d3.select(el).attr("transform");
      var currect = d3.select(el.parentNode).append("rect")
        .attr("x", curBBox.x - 2.5)
        .attr("y", curBBox.y - 2.5)
        .attr("width", curBBox.width + 4.5)
        .attr("height", curBBox.height + 4.5)
        .attr("transform", curTransform)
        .classed("wbip-BBox", true);
      return currect;
    };
  
  obj.drawAttention =
    // Draw a circle centred on the given d3 selection
    // Circle starts large, then shrinks to nothing
    function(sel){
      var el = sel[0][0]
      var curBBox = el.getBBox();
      var curTransform = d3.select(el).attr("transform");
      var cx = curBBox.x + curBBox.width/2;
      var cy = curBBox.y + curBBox.height/2;
      var r = Math.max(curBBox.width, curBBox.height)/2;
      var curcircle = d3.select(el.parentNode).append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .attr("transform", curTransform)
        .classed("wbip-attention", true);
      curcircle.transition().duration(1000).attr("r", 0).remove();
      return curcircle;
    };
  
  obj.getParent =
    // Given an SVG element, find the closest parent element
    // that is of class given in "ofclass"
    // if such a parent doesn't exist, returns undefined
    function(el, ofclass){
      var isparent = false;
      while(isparent == false){
        el = el.parentNode;
        if(el.nodeName === "HTML"){return undefined;}
        isparent = d3.select(el).classed(ofclass);
      }
      return el;
    };
  
  obj.button =
    // Draw a button
    // Consists of a background rect, text,
    //  and an invisible foreground rect
    function(gMenu, curID, transxy, dim, label, tooltip, styles, events){
      transxy = wbip.defarg(transxy, [0, 0]);
      dim = wbip.defarg(dim, [20, 20]);
      
      var curG = gMenu.append("g")
        .attr("id", curID)
        .attr("transform", wbip.utils.translate(transxy))
        .classed("wbip-button", true);
      
      var cbg = curG.append("rect")
        .attr("width", dim[0])
        .attr("height", dim[1])
        .classed("wbip-button-bg", true);
      if(label !== undefined){
        var ctext = curG.append("text")
          .attr("x", dim[0]/2)
          .attr("y", dim[1]/2)
          .text(label)
          .classed("wbip-button-text", true);
        var cfg = curG.append("rect")
          .attr("width", dim[0])
          .attr("height", dim[1])
          .classed({"wbip-button-fg": true, "wbip-fg": true});
      }
      if(tooltip !== undefined){curG.append("title").html(tooltip);}
      // styles
      if(styles !== undefined){
        for(var curstyle in styles.bg){
          cbg.style(curstyle, styles.bg[curstyle]);
        }
        for(var curstyle in styles.text){
          ctext.style(curstyle, styles.text[curstyle]);
        }
        for(var curstyle in styles.fg){
          ctext.style(curstyle, styles.fg[curstyle]);
        }
      }
      
      // events
      for(var curevt in events){
        curG.on(curevt, events[curevt]);
      }
      
      return curG;
    };
  
  return obj;
}();
