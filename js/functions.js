'use strict';
// generates a random color
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// mute audioable pages
function muteTab(e) {
  let tabId = Number(e);
  chrome.tabs.get(tabId, function (tab) {
    chrome.tabs.update(tabId, { muted: !tab.mutedInfo.muted });
    $("#" + tabId).siblings(".audio").attr("src", tab.mutedInfo.muted ? "img/SoundIcon.png" : "img/MuteIcon.png")
  })

}

// select item to switch tab
function selectTab(e) {
  var tabId = Number(e);
  chrome.tabs.update(tabId, { active: true });
}

// open clicked link
function openNewTab(e){
  chrome.tabs.create({'url': e});
}

// close the tab
function closeTab(e) {
  let tabId = Number(e);
  chrome.tabs.remove(tabId);
  let tabElement  = $("#" + e).parent();
  if (tabElement.length === 1) {
      $("#" + e).parent().remove();
  }
}


// search through the item tags
function search() {
  var input, filter, ul, li, a, i;
  input = document.getElementsByClassName('search');
  filter = input[0].value.toUpperCase();
  ul = document.getElementsByClassName("listMain");
  for (let t = 0; t < ul.length; t++) 
  {
    li = ul[t].getElementsByTagName('li');
      var hideDiv=true;
      ul[t].style.display="block";
    for (let i = 0; i < li.length; i++) 
    {
      a = li[i].getElementsByTagName("span")[0];
      if (a.title.toUpperCase().indexOf(filter) > -1) 
      {
        hideDiv=false;
        li[i].style.display = "";
        addSelectTabListener(li[i]);
      } 
      else 
      {
        li[i].style.display = "none";
      }
    }
      if(hideDiv==true){
         ul[t].style.display="none"; 
      }
  }
    
    
    
}

function getSelectedTabs(shouldUncheck) {
  var lists = [];
  var urlList = [];
  var removeList = [];
  var checkedBoxes = document.querySelectorAll('input[name=urlcb]:checked');
  checkedBoxes.forEach(function (e) {
    urlList.push(e.value);
    removeList.push(e.parentElement.lastChild.id)
    if (shouldUncheck){
      e.checked = false;
    }
  });
  lists.push(urlList, removeList);
  return lists;
}
// function pinTab(e){
//   let tabId = Number(e);
//   chrome.tabs.get(tabId,function(tab){ 
//      chrome.tabs.update(tabId, { pinned: !tab.pinned });

//      $("#"+tabId).siblings(".audio").attr("src", tab.pinned? "\\img\\pin.png": "\\img\\unpin.png")
//   })
// }

// export urls to external txt file
function exportTabsFn() {
  var urls = [];
  chrome.windows.getAll({ populate: true }, function (windows) {
    windows.forEach(function (window) {
      window.tabs.forEach(function (tab) {
        urls.push(tab.url);
      });
    });
    var n = urls.join("\n");
    var currentTime = new Date().toJSON().slice(0, 10);
    // save file
    var blob = new Blob([n], { type: "text/plain;charset=utf-8" });
    saveAs(blob, currentTime + "_urls.txt");
  });
}

function switchToDarkMode(lightOn) {
  let navBars = Array.from(document.getElementsByClassName('navbar'));
  let container = document.getElementsByClassName('container')[0].style;
  let mainList  = document.getElementById('cbList');
  let allLists = document.querySelectorAll('#list');
  let toolbarOfList = document.querySelectorAll('.closeWindow');
  let searchInput = document.getElementsByClassName('search')[0];
  // Saved tab list elements
  let savedList  = document.getElementById('cbListSaved');
  let savedToolbarOfList = document.querySelectorAll('.selectAll');
  let savedMainList = document.querySelectorAll('.listMain');
  let html = document.getElementsByTagName("html")[0];
  let body = document.getElementsByTagName("body")[0];

  chrome.storage.local.get(['darkModeIs'], function (result) {
    let darkModeIs = (typeof lightOn === 'boolean') ? !lightOn : result.darkModeIs;
    if (darkModeIs) {
      // Dark mode is off
      chrome.storage.local.set({ "darkModeIs": false });

      navBars.forEach(function (e) {
        e.classList.remove('dark')
      })
      allLists.forEach(function (e) {
        e.classList.remove('darkish');
      })
      toolbarOfList.forEach(function (e) {
        e.parentElement.classList.remove('darkish');
      })
      container.color = "black";
      mainList.classList.remove('dark');
      searchInput.classList.remove('darkish');
      searchInput.style.color = "";
      html.classList.remove('dark');
      body.classList.remove('dark');

      // Saved tab list
      savedList.classList.remove('dark');
      savedToolbarOfList.forEach(function (e) {
        e.parentElement.classList.remove('darkish');
      })
      savedMainList.forEach(function (e) {
        e.classList.remove('darkish');
      })

      document.getElementById('darkMode').src = "img/dark.png";
    } else {
      // save the state 
      chrome.storage.local.set({ "darkModeIs": true });
      // the main tab list
      navBars.forEach(function (e) {
        e.classList.add('dark');
      })
      allLists.forEach(function (e) {
        e.classList.add('darkish');
      })
      toolbarOfList.forEach(function (e) {
        e.parentElement.classList.add('darkish');
      })
      container.color = "white";
      mainList.classList.add('dark');
      searchInput.classList.add('darkish');
      searchInput.style.color = "white";
      html.classList.add('dark');
      body.classList.add('dark');

      // Saved tab list
      savedList.classList.add('dark');
      savedToolbarOfList.forEach(function (e) {
        e.parentElement.classList.add('darkish');
      })
      savedMainList.forEach(function (e) {
        e.classList.add('darkish');
      })

      document.getElementById('darkMode').src = "img/light.png"
    }
  });
}

// separate extension into different window
function separateExtFn() {
  let href = window.location.href;
  const bodyRect = document.querySelector('body').getBoundingClientRect();
  chrome.windows.create({
    url: href,
    type: 'popup',
    width: Math.round(bodyRect.width),
    height: Math.round(bodyRect.height + 150),
  });
}

function addSelectTabListener(el) {
  el.addEventListener('click', function (e) {
    selectTab(e.target.nextSibling.id);
  });
}

function BindListenersToElements() {
  let closes = Array.from(document.getElementsByClassName('cclose'));
  let urlTexts = Array.from(document.getElementsByClassName('item'))
  let audio = Array.from(document.getElementsByClassName('audio'))
  let saveSessionName = document.getElementById('saveSessionNameBt');
  // listeners
  closes.map(function (close) {
    close.addEventListener('click', function (e) {
        closeTab(e.target.id);
    });
  })

  urlTexts.map(function (urlText) {
    addSelectTabListener(urlText);
  })

  audio.map(function (audioEl) {
    audioEl.addEventListener('click', function (e) {
      muteTab(e.target.parentNode.lastChild.id);
    });
  })
}

function openSavedList(){
   document.getElementById('btsavedlist').style.display = 'none';
   document.getElementById('btback').style.display = '';
   document.getElementById('cbList').style.display = 'none';
  chrome.storage.local.get(null, function (result) {
    let allKeys = Object.keys(result);
    generateSavedListWindow(allKeys);
  });
}

function goBackTabList(){
  document.getElementById('btsavedlist').style.display = '';
  document.getElementById('btback').style.display = 'none';
  document.getElementById('cbList').style.display = '';
  document.getElementById('cbListSaved').style.display = 'none';

}
