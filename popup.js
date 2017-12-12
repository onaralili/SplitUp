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
      let ul = document.createElement("ul");
      ul.setAttribute("class","list");

        windows.forEach(function(window){
          console.log("win. id " + window.id)
        window.tabs.forEach(function(tab){

          // main tag
          let li = document.createElement("li");
          let urlText =  document.createElement("span");
          let icon =  document.createElement("img");
          let checkbox = document.createElement("input");
          icon.setAttribute("src",tab.favIconUrl);
          icon.setAttribute("width","16");
          icon.setAttribute("height","16");
          icon.setAttribute("class","urlIcon")
          urlText.setAttribute("class","item");
          urlText.textContent = tab.title.substring(0,50);
          checkbox.setAttribute("type","checkbox");
          checkbox.setAttribute("name","urlcb");
          checkbox.setAttribute("class","cb");
          checkbox.value = tab.url;
          // append tags
          li.appendChild(checkbox);
          li.appendChild(icon);
          li.appendChild(urlText);
          ul.appendChild(li);

          cbList.appendChild(ul);

        });
      });
      var options = {
        valueNames: [ 'item','cb','urlIcon' ]
    };
    
    var wUrlList = new List('cbList', options);

    $(".search").keyup(function(){
      wUrlList.search($(this).val());
  });

    });
  


});