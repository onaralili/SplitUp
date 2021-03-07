'use strict';
document.addEventListener('DOMContentLoaded', () => {

  var btInfo = document.getElementById("btinfo");
  btInfo.addEventListener("click", () => {

  });


  var btSplitUp = document.querySelector(".splitUpBt");
  var windowsList = [];
  const splitUp = () => {
    var lists = getSelectedTabs();
    //creates a window
    if (lists[0] !== null) {
      chrome.windows.create({
        url: lists[0],
        type: "normal"
      });
    }
    // remove moved tabs from the current window
    for (let index = 0; index < lists[1].length; index++) {
      closeTab(lists[1][index])
    }
  };
  btSplitUp.addEventListener('click', splitUp);
  chrome.commands.onCommand.addListener(command => {
    if (command === 'split-up') splitUp();
  });
  chrome.windows.getAll({ populate: true }, function (windows) {
    var cbList = document.getElementById("cbList");
    let count = 0;
    windows.forEach(function (window) {
      count++;
      let color = getRandomColor();
      let listId = "list_" + window.id;
      let saveLocally = document.createElement('div');
      let buttonCollapse = document.createElement('button');
      let saveLocallyImg = document.createElement('img');
      let closeWindow = document.createElement('img');
      let selectAll = document.createElement('img');

      buttonCollapse.className = "collapsible";
      buttonCollapse.innerText = "Window " + count;

      saveLocallyImg.setAttribute('src', "img/save.png");
      saveLocallyImg.style.width = "16px";
      saveLocallyImg.style.height = "16px";
      saveLocallyImg.className = "savelocally";
      saveLocallyImg.title = "Save to Sessions";

      closeWindow.setAttribute('src', "img/trash.png");
      closeWindow.style.width = "16px";
      closeWindow.style.height = "16px";
      closeWindow.className = "closeWindow";
      closeWindow.style.marginBottom = "0";
      closeWindow.style.marginRight = "0.8em";
      closeWindow.title = "Close the window or selected tabs";

      selectAll.setAttribute('src', "img/checkbox_outline.png");
      selectAll.style.width = "20px";
      selectAll.style.height = "20px";
      selectAll.className = "selectAll";
      selectAll.style.marginBottom = "-2px";
      selectAll.style.marginRight = "0.3em";
      selectAll.title = "Select all tabs in this window";
      windowsList.push(listId);

      let list = document.createElement("div");
      list.setAttribute('id', listId);
      list.classList.add("listMain")
      list.id = window.id;
      saveLocally.style.backgroundColor = "white";
      saveLocally.style.position = "relative";
      saveLocally.style.textAlign = "right";
      saveLocally.appendChild(closeWindow);
      saveLocally.appendChild(saveLocallyImg);
      saveLocally.appendChild(selectAll);
      saveLocally.appendChild(buttonCollapse);
      list.appendChild(saveLocally);
      cbList.appendChild(list);

      let ul = document.createElement("ul");
      ul.setAttribute('id', "list");
      ul.classList.add('collapsibleContent');
      // check if the window is current then collapse the list
      chrome.windows.getCurrent(function (currentWindow) {
        if (currentWindow.id == window.id) {
          ul.style.display = "block";
          buttonCollapse.style.fontWeight = "bold";
        }
      });
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
        if (tab.favIconUrl !== undefined) {
          icon.setAttribute("src", tab.favIconUrl);
        } else {
          icon.setAttribute("src", "img/default_favicon.png");
        }
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
          audioIcon.setAttribute("src", "img/SoundIcon.png");
          audioIcon.setAttribute('class', 'audio')
          audioIcon.setAttribute("width", "16");
          audioIcon.setAttribute("height", "16");
          li.appendChild(audioIcon);

        }
        // append tags
        li.appendChild(checkbox);
        li.appendChild(icon);
        li.appendChild(urlText);
        li.appendChild(close);
        ul.appendChild(li);


        var cols = document.querySelectorAll('#list .listItem');
        [].forEach.call(cols, addDnDHandlers);
        var searchInput = document.getElementsByClassName('search')[0];
        searchInput.addEventListener('keyup', function () {
          search();
        });
        searchInput.focus();
        // check if dark mode is on
        chrome.storage.local.get(['darkModeIs'], function (result) {
          switchToDarkMode(result.darkModeIs);
        })
        document.getElementById("exportTabs").addEventListener('click', exportTabsFn);
        document.getElementById("darkMode").addEventListener('click', switchToDarkMode);
        document.getElementById("separate").addEventListener('click', separateExtFn);
        document.getElementById('btsavedlist').addEventListener('click', openSavedList)
        document.getElementById('btback').addEventListener('click', goBackTabList)
        $(".savelocally").off().on('click', function (e) {
          const selectedWindow = e.target.parentElement.parentElement;
          const windowId = selectedWindow.id;
          saveUrlsLocally(windowId);
        });
        $(".closeWindow").off().on('click', function (e) {
          var selectedTabs = getSelectedTabs();
          if (selectedTabs[1].length > 0) {
            selectedTabs[1].forEach(function (tab) {
              closeTab(tab);
            })
          } else {
            const selectedWindow = e.target.parentElement.parentElement;
            const windowId = Number(selectedWindow.id);
            if (confirm("Close this window?")) {
              chrome.windows.remove(windowId);
              document.getElementById(windowId).remove();
            }
          }
        });
        $(".selectAll").off().on('click', function (e) {
            let checkboxImg = 'img/checkbox.png';
            if (e.target.getAttribute('src') === 'img/checkbox.png') {
              checkboxImg = 'img/checkbox_outline.png';
            }
            e.target.setAttribute('src', checkboxImg);
            let savedListDOM = e.target.parentNode.parentNode.lastChild;
            let lp = savedListDOM.childNodes;
            for (var i = 0; i < lp.length; i++) {
                lp[i].firstChild.click();
            }
        });
      });

      var coll = document.getElementsByClassName("collapsible");
      var i;

      for (i = 0; i < coll.length; i++) {
        $(coll[i]).unbind('click').click(function () {
          this.classList.toggle("active");
          var content = this.parentElement.nextElementSibling;

          if (content.style.display === "block") {
            content.style.display = "none";
            console.log("should be hidden: ", content.style.display)
          } else {
            content.style.display = "block";
            console.log("should be block: ", content.style.display)

          }
        });
      }

      // binds listeners to the elements
      BindListenersToElements();
    });
  });
});




