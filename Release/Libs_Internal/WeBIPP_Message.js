wbip.message = function(){
  var obj = {tags: "message", type: "special"};
  
  obj.new =
    // Add an event listener for messages
    function(){
      window.addEventListener("message", obj.process);
    };
  
  obj.process =
    // What to do with messages
    // When a message is first received from a new source
    // Give a prompt asking if user wants to accept for the session
    function(event){
      if(wbip.utils.contains(obj.whitelist, "all", event.origin)){
        var result = true;
      } else{
        // If the event originates from an unknown source
        // Open a confirm window
        var result = window.confirm("WeBIPP has received a message" +
          " originating from " + event.origin + "\n" +
          "Press OK to accept messages from this source.\n" +
          "You should only accept this if you were expecting it.");
        if(result === true){
          obj.whitelist.push(event.origin);
        }
      }
      
      if(result === true){
        if(typeof event.data !== "string"){
          window.alert("Received message cannot be parsed.\n" +
            "Message is not a string.");
          return;
        }
        
        // event.data should be JSON, of form:
        // {"dataset-name": <JSON>}
        // Potentially carrying more than 1 dataset
        try{
          var alldata = JSON.parse(event.data);
        } catch(e){
          window.alert("Received message cannot be parsed.\n" +
            "See console log for details.");
          console.log(event.data);
          return;
        }
        
        for(var datname in alldata){
          wbip.datanew(datname, JSON.stringify(alldata[datname]));
        }
        
        // Send a successful response
        event.source.postMessage("Success", "*");
      } else{
        // Send a blocked response
        event.source.postMessage("Blocked", "*");
      }
    };
  
  obj.whitelist = [];
  
  return obj;
}();
wbip.addon("message");
