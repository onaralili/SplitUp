document.addEventListener('DOMContentLoaded', () => {
    var btSplit = document.getElementById('btSplit');
    var urlList = [];
    btSplit.addEventListener('click',()=>{

      var checkedBoxes = document.querySelectorAll('input[name=urlcb]:checked');
      
      checkedBoxes.forEach(function(e){
        urlList.push(e.value);
      })

      //creates a window
      if(urlList!=null){
        chrome.windows.create({
          url: urlList,
          type: "normal"
        });
      }
     

    })  

    chrome.windows.getAll({populate:true},function(windows){
      var cbList = document.getElementById("cbList");
      windows.forEach(function(window){
        window.tabs.forEach(function(tab){

          var labelEl = document.createElement("label");
          var inputContent = document.createElement("input");
          var icon =  document.createElement("img");


          inputContent.setAttribute("type","checkbox");
          inputContent.setAttribute("name","urlcb");
          icon.setAttribute("src",tab.favIconUrl);
          icon.setAttribute("width","16");
          icon.setAttribute("height","16");

          labelEl.appendChild(inputContent);
          var t = document.createTextNode(tab.title.substring(0,50));
          inputContent.value = tab.url;
          labelEl.appendChild(icon);
          labelEl.appendChild(t);

          var p = document.createElement("p");
          p.appendChild(labelEl)

          cbList.appendChild(p);

        });
      });
    });
});