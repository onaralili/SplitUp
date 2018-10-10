"use strict"
document.addEventListener('DOMContentLoaded', () => {
  var btSplitUp = document.querySelector(".splitUpBt");
  var windowsList = [];
  btSplitUp.addEventListener('click', () => {

   var lists = getSelectedTabs();
    //creates a window
    if (lists[0] != null) {
      chrome.windows.create({
        url: lists[0],
        type: "normal"
      });
    }
    // remove moved tabs from the current window
    for (let index = 0; index < lists[1].length; index++) {
      closeTab(lists[1][index])
    }
  })

  chrome.windows.getAll({ populate: true }, function (windows) {
    var cbList = document.getElementById("cbList");

    windows.forEach(function (window) {
      let color = getRandomColor();
      let listId = "list_" + window.id;
      let saveLocally = document.createElement('div');
      let saveLocallyImg = document.createElement('img');
      let closeWindow = document.createElement('img');
      let selectAll = document.createElement('img');

      saveLocallyImg.setAttribute('src', "img/save.png");
      saveLocallyImg.style.width = "16px";
      saveLocallyImg.style.height = "16px";
      saveLocallyImg.className = "savelocally";
      selectAll.setAttribute('src', "img/select.png");
      selectAll.style.width = "16px";
      selectAll.style.height = "16px";
      selectAll.title = "Select all"
      selectAll.className = "selectAll";
      selectAll.style.marginBottom = "-1px";
      selectAll.style.marginRight = "0.3em";
      closeWindow.setAttribute('src', "img/trash.png");
      closeWindow.style.width = "16px";
      closeWindow.style.height = "16px";
      closeWindow.className = "closeWindow";
      closeWindow.style.marginBottom = "0";
      closeWindow.style.marginRight = "0.3em";
      windowsList.push(listId);

      let list = document.createElement("div");
      list.setAttribute('id', listId);
      list.classList.add("listMain")
      list.id = window.id;
      saveLocally.style.backgroundColor = "white";
      saveLocally.style.position = "relative";
      saveLocally.style.textAlign = "right";
      saveLocally.appendChild(selectAll);
      saveLocally.appendChild(closeWindow);
      saveLocally.appendChild(saveLocallyImg);
      list.appendChild(saveLocally);
      cbList.appendChild(list);

      let ul = document.createElement("ul");
      // ul.classList.add("list");  
      ul.setAttribute('id', "list");
      list.setAttribute('style', 'border-left: 8px solid ' + color + '!important;')
      list.appendChild(ul);

      window.tabs.forEach(function (tab) {

        let li = document.createElement("li");
        let urlText = document.createElement("span");
        let icon = document.createElement("img");
        let checkbox = document.createElement("input");
        let close = document.createElement("input");
        li.setAttribute("draggable", "true");
        li.setAttribute("class", "listItem");
        li.id = tab.index;
        icon.setAttribute("src", tab.favIconUrl);
        icon.setAttribute("width", "16");
        icon.setAttribute("height", "16");
        icon.setAttribute("class", "urlIcon")
        close.setAttribute('class', 'cclose');
        urlText.setAttribute("class", "item");
        urlText.textContent = tab.title.substring(0, 37);
        urlText.title = tab.title;
        close.value = 'x';
        close.type = 'button';
        close.style.fontWeight = 'bold';
        close.id = tab.id;
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "urlcb");
        checkbox.setAttribute("class", "cb");
        checkbox.value = tab.url;
        // make it bold
        if (tab.active) {
          urlText.style.fontWeight = "bold";
        }
        if (tab.audible) {
          let audioIcon = document.createElement("img");
          audioIcon.setAttribute("src", "\\img\\SoundIcon.png");
          audioIcon.setAttribute('class', 'audio')
          audioIcon.setAttribute("width", "16");
          audioIcon.setAttribute("height", "16");
          li.appendChild(audioIcon);

        }
        // if(tab.pinned){
        //   let pinnedIcon = document.createElement("img");
        //   pinnedIcon.setAttribute("src", "\\img\\pin.png");
        //   pinnedIcon.setAttribute('class','audio')
        //   pinnedIcon.setAttribute("width", "16");
        //   pinnedIcon.setAttribute("height", "16");
        //   li.appendChild(pinnedIcon);

        //   pinnedIcon.addEventListener('click',function(e){
        //     pinTab(e.path[1].lastChild.id);
        //     console.log(e.path[1].lastChild.id)
        // });
        // }
        // append tags
        li.appendChild(checkbox);
        li.appendChild(icon);
        li.appendChild(urlText);
        li.appendChild(close);
        ul.appendChild(li);

        // close.addEventListener('click', function (e) {
        //   closeTab(e.path[0].id);
        // });

        // urlText.addEventListener('click', function (e) {
        //   selectTab(e.path[1].childNodes[3].id);
        // });

        // binds listeners to the elements
        BindListenersToElements();

        var cols = document.querySelectorAll('#list .listItem');
        [].forEach.call(cols, addDnDHandlers);

        $(".search").keyup(function () {
          search();
        });

        document.getElementById("exportTabs").addEventListener('click', exportTabsFn);
        document.getElementById("separate").addEventListener('click', separateExtFn);
        document.getElementById('btsavedlist').addEventListener('click', openSavedList)
        document.getElementById('btback').addEventListener('click', goBackTabList)
        $(".savelocally").off().on('click', function (e) {
          const selectedWindow = e.target.parentElement.parentElement;
          const windowId = selectedWindow.id;
          saveUrlsLocally(selectedWindow, windowId);
          document.getElementById(windowId).getElementsByClassName('savelocally')[0].setAttribute('src', 'img/loading.gif');
        });
        $(".selectAll").off().on('click', function (e) {
            $("#list .cb").prop( "checked", true );
        });
        $(".closeWindow").off().on('click', function (e) {
          var selectedTabs = getSelectedTabs();
          if (selectedTabs[1].length > 0){
            selectedTabs[1].forEach(function(tab){
              closeTab(tab);
            })
          } else  {
            const selectedWindow = e.target.parentElement.parentElement;
            const windowId = Number(selectedWindow.id);
            if (confirm("Close this window?")) {
              chrome.windows.remove(windowId);
              document.getElementById(windowId).remove();
            } 
          }
        });
      });
    });
  });
});




