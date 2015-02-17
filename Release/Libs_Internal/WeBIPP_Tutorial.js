wbip.tutorial = function(){
  var obj = {tags: "tutorial", type: "special", requires: ["terminal"]};
  
  obj.hasrun = false;
  
  obj.new =
    function(){
      // If tutorial has run, don't run again
      if(obj.hasrun === true){
        return;
      } else{
        obj.hasrun = true;
      }
      // Add some basic data for testing purposes
      wbip.datanew("datSimple",
        '{"val":[1,2,3,4,5,6,7,8,9,10],' +
        ' "label":["A","B","C","D","E","F","G","H","I","J"],' +
        ' "valsum":[0,1,3,6,10,15,21,28,36,45]}');
      
      // Define colours
      var nextbg = wbip.hcl(120,25,65);
      var nextfg = wbip.hcl(120,35,85);
      var prevbg = wbip.hcl(60,25,65);
      var prevfg = wbip.hcl(60,35,85);
      
      var nextfunc =
        function(){
          var curi = obj.index;
          d3.selectAll(".wbip-tutorial-temp").remove();
          if(obj.msgs[curi] !== undefined){
            // Print next tutorial message
            curdiv.html(obj.msgs[curi].text);
            // Carry-out next tutorial tasks
            obj.msgs[curi].act();
            // Increment index
            obj.index += 1;
            // Flash button for visual confirm
            var btn = d3.select("#wbip-tutorial-nextbtn").select("rect")
            btn.interrupt();
            btn.style("fill", nextfg);
            btn.transition().duration(1000).style("fill", nextbg);
          }
        };
      var prevfunc =
        function(){
          var curi = obj.index - 2;
          d3.selectAll(".wbip-tutorial-temp").remove();
          if(obj.msgs[curi] !== undefined){
            // Print next tutorial message
            curdiv.html(obj.msgs[curi].text);
            // Carry-out next tutorial tasks
            obj.msgs[curi].act();
            // Increment index
            obj.index = curi + 1;
            // Flash button for visual confirm
            var btn = d3.select("#wbip-tutorial-prevbtn").select("rect")
            btn.interrupt();
            btn.style("fill", prevfg);
            btn.transition().duration(1000).style("fill", prevbg);
          }
        };
      var curID = "wbip-tutorial";
      var dim = [450, 250];
      var transxy = [200, 200];
      var ffw = wbip.ffw.new(wbip.vars.svg, curID, dim, transxy);
      var curdiv = ffw.append("foreignObject")
        .attr("width", dim[0])
        .attr("height", dim[1] - 50)
        .classed("unselectable", true)
        .append("xhtml:body").append("div")
          .attr("id", curID + "-div")
          .style("height", dim[1] - 60)
          .style("overflow-y", "auto");
      
      var curG = ffw.append("g")
        .attr("transform", wbip.utils.translate(10, dim[1] - 40))
        .attr("id", "wbip-tutorial-prevbtn")
        .on("click", prevfunc);
      curG.append("rect")
        .attr("width", 30)
        .attr("height", 30)
        .style("fill", prevbg);
      curG.append("path")
        .attr("d", "M 15,5 L 5,15 L 15,25 V 20 H 25 V 10 H 15 z")
        .style("stroke", "black")
        .style("fill", prevfg);
      
      var curG = ffw.append("g")
        .attr("transform", wbip.utils.translate(dim[0] - 40, dim[1] - 40))
        .attr("id", "wbip-tutorial-nextbtn")
        .on("click", nextfunc);
      curG.append("rect")
        .attr("width", 30)
        .attr("height", 30)
        .style("fill", nextbg);
      curG.append("path")
        .attr("d", "M 15,5 L 25,15 L 15,25 V 20 H 5 V 10 H 15 z")
        .style("stroke", "black")
        .style("fill", nextfg);
      
      obj.index = 0;
      nextfunc();
    };
  
  obj.highregion =
    function(sel){
      wbip.utils.drawAttention(sel);
      var t0 = sel.transition().duration(1000);
      t0.style("opacity", 0.5);
      t0.transition().duration(2000).delay(2000).style("opacity", 1);
    };
  obj.highobject =
    function(gParent, transf){
      var hr = gParent.append("rect")
        .classed("wbip-tutorial-temp", true)
        .attr("transform", transf)
        .attr("x", -5)
        .attr("y", -5)
        .attr("width", 30)
        .attr("height", 30)
        .style("pointer-events", "none")
        .style("fill", "white")
        .style("opacity", 0.2);
      wbip.utils.drawAttention(hr);
      var t0 = hr.transition().duration(1000);
      t0.style("opacity", 0.5);
      t0.transition().duration(2000).delay(2000).style("opacity", 0.2);
    };
  
  obj.msgs = [
    {text: '<b>WeBIPP (v' + wbip.version + ') Tutorial</b><br/>' +
           'Move this window around by dragging the dark blue bar.<br/>' +
           'You can end the tutorial at any time by closing this window.<br/>' +
           'Use the arrows below to navigate through the tutorial. When you are ready' +
           ' use the green arrow to move to the next message.',
      act: function(){
      }
    },
    {text: "This is the Primary Buttons Region, where you will find" +
           " buttons to place new objects into the Graph Region.",
      act: function(){
        obj.highregion(wbip.vars.gMenuPri);
      }
    },
    {text: "This is the Graph Region, where the plot is drawn.",
      act: function(){
        obj.highregion(wbip.vars.gGraph);
      }
    },
    {text: "The Primary Buttons Region has a button for the Cartesian Frame." +
           " Click it and it will be highlighted in green." +
           "<br/>Now click anywhere on the Graph Region to place a new" +
           " Cartesian Frame.",
      act: function(){
        obj.highobject(wbip.vars.gMenuPri, d3.select("g.wbip-icon-frcart").attr("transform"));
      }
    },
    {text: "This is the Object Menu. You will notice" +
           " that it now contains an object called \"gEL1\"." +
           " The icon by the ID indicates the type of object," +
           " a Cartesian Frame. Click this now.",
      act: function(){
        obj.highregion(wbip.vars.gMenuTab);
      }
    },
    {text: "Notice that the Primary Buttons Region has been replaced by" +
           " the Attribute Interface." +
           "<br/>This interface is used to assign various attributes and" +
           " styles to the associated objects.",
      act: function(){
      }
    },
    {text: "This is the Tertiary Buttons Region, where you will find" +
           " the Main Menu button (M) and the Data Viewer button (D)." +
           "<br/>Click on the Data Viewer button now.",
      act: function(){
        obj.highregion(wbip.vars.gMenuTer);
      }
    },
    {text: "The Data Viewer window is like this tutorial window" +
           " and can be freely moved around or closed." +
           "<br/>It displays a listing of all currently loaded datasets" +
           " and their variable headings." +
           "<br/>In the future, it will also support displaying the data itself." +
           "<br/>Try clicking on the data variable headings now.",
      act: function(){
      }
    },
    {text: "Notice that the x axis of the Cartesian Frame changes." +
           "<br/>The Cartesian Frame is used to implement an arbitrary" +
           " cartesian coordinate space within the Graph Region, which is" +
           " helpful for creating data-based statistical plots." +
           "<br/>The \"x\" attribute can be used to assign a data variable" +
           " to the x axis domain, which is then mapped across the width of" +
           " the entire frame, bounded by the x axis range (represented" +
           " as a proportion of the entire width)." +
           '<br/>Assign the variable "label" to "x" now, by clicking on' +
           ' "label" in the Data Viewer.',
      act: function(){
      }
    },
    {text: 'Click on "x" in the Attribute Interface to bring up a list' +
           ' of all valid attributes and styles. Click on "y" to select it.' +
           '<br/>Now assign the variable "val" to "y", by clicking on' +
           ' "val" in the Data Viewer.',
      act: function(){
      }
    },
    {text: "We can also assign domains and ranges for the axes manually." +
           '<br/>Select the "domain" attribute within "y"' +
           " then click on the value." +
           "<br/>This brings up a terminal which can be used to assign a" +
           " new value to the domain. Set the new domain to be [0, 10] now." +
           '<br/>Also set the "range" attribute within "y" to [1, 0.05].',
      act: function(){
      }
    },
    {text: "Coordinates in SVG images start from the top-left corner," +
           " with higher values of x corresponding to a movement to the right" +
           " and higher values of y corresponding to a movement down." +
           '<br/>Thus by assigning our "y" to map from a domain of [0, 10]' +
           ' to a range of [1, 0.05], a "y" value of 0 will correspond to' +
           " the very bottom of the Cartesian Frame (100% of the way down" +
           " from the top of the frame); while a value of 10 will" +
           " correspond to 5% of the way down from the top of the frame." +
           "<br/>Values in between 0 and 10 are interpolated linearly across" +
           " the range.",
      act: function(){
      }
    },
    {text: "Click on \"gEL1\" in the Object Menu to unselect it.",
      act: function(){
      }
    },
    {text: "The Primary Buttons Region has a button for a Rectangle." +
           " Use this to drop a rectangle within the Cartesian Frame" +
           " in the Graph Region." +
           "<br/>By dropping it within the frame, the rectangle is now" +
           " a child of the Cartesian Frame, and can be made to obey the" +
           " coordinate space of the frame.",
      act: function(){
        obj.highobject(wbip.vars.gMenuPri, d3.select("g.wbip-icon-rect").attr("transform"));
      }
    },
    {text: "Click on \"gEL2\" in the Object Menu to select it," +
           ' then assign "label" to "x" and "val" to "y".' +
           " This gives us a scatterplot, with rectangles as our symbol." +
           "<br/>Notice the rectangle replicates itself to match the length" +
           " of the data assigned to it, as each rectangle's x and y attributes" +
           ' takes a value from the variables "label" and "val".',
      act: function(){
      }
    },
    {text: "We can also assign these attributes manually, as with the Cartesian Frame." +
           ' Select the "y" attribute, and set this to 0.',
      act: function(){
      }
    },
    {text: 'Now assign the variable "val" to the "height" attribute.' +
           " Notice that the rectangle is centred on y = 0." +
           '<br/>We can control this by adjusting the "adj" attribute within "y".' +
           ' Set adj to 1 now.<br/>This means our "y" now defines the bottom edge' +
           " of our rectangles. adj = 0.5 would define the centre," +
           " and adj = 0 would define the top edge.",
      act: function(){
      }
    },
    {text: "You should now have a barplot." +
           "<br/>We can save our work by clicking on the Main Menu button" +
           " in the Tertiary Buttons Region, then selecting Save." +
           "<br/>Note that when you do this, WeBIPP is merely collecting" +
           " all the necessary information and outputting it as a" +
           " text file for the browser to handle. How your browser" +
           " handles it is up to your default preferences. Most likely" +
           " it will simply open it up in a new window or tab." +
           " You will then have to tell the browser to save this text" +
           " to complete \"saving\" of your work.",
      act: function(){
      }
    },
    {text: "The contents of the save is not the final graphical output," +
           " but rather the sequence of actions you took during the session." +
           "<br/>This record carries all the information needed to" +
           " fully replicate the final graphical output." +
           "<br/>You can view this code at any time by choosing" +
           " Code-WeBIPP in the Main Menu.",
      act: function(){
      }
    },
    {text: "One of the foundational features of WeBIPP is that your input" +
           " is recorded in this manner, as discrete function calls" +
           " that is of course fully edittable." +
           "<br/>These WeBIPP function calls in turn generate D3.js" +
           " code, that is used to generate the graphical output." +
           " Unlike the WeBIPP code, this D3.js code is not a complete" +
           " record of all your actions, and by themselves cannot fully" +
           " replicate the final graphical output. However, they" +
           " grant an insight into the details of how the graphical" +
           " output is produced." +
           "<br/>One intended feature of WeBIPP will be a way to" +
           " directly edit the D3.js code, enabling utilisation of" +
           " features that D3.js and JavaScript can support, but WeBIPP's" +
           " interface does not. However, this needs to be done in a way" +
           " that is still recorded in the WeBIPP code in a sensible manner" +
           " such that it remains a complete record.",
      act: function(){
      }
    },
    {text: "This concludes the basic tutorial." +
           "<br/>Try experimenting with different objects and different" +
           " attributes to see what you can make!",
      act: function(){
      }
    }
  ];
  
  return obj;
}();
wbip.addon("tutorial");
