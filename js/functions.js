"use strict"
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

    $("#" + tabId).siblings(".audio").attr("src", tab.mutedInfo.muted ? "\\img\\SoundIcon.png" : "\\img\\MuteIcon.png")
  })

}

// select item to switch tab
function selectTab(e) {
  var tabId = Number(e);
  chrome.tabs.update(tabId, { active: true });
}

// close the tab
function closeTab(e) {
  let tabId = Number(e);
  chrome.tabs.remove(tabId);
  $("#" + e).parent().remove();
  e.stopPropagation();
  e.preventDefault();
}


// search through the item tags
function search() {
  console.log("ss")
  var input, filter, ul, li, a, i;
  input = document.getElementsByClassName('search');
  filter = input[0].value.toUpperCase();
  ul = document.getElementsByClassName("listMain");
  for (t = 0; t < ul.length; t++) {
    li = ul[t].getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("span")[0];
      if (a.title.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }
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
  console.log("sss")
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


// separate extension into different window
function separateExtFn() {
  let href = window.location.href;
  const bodyRect = document.querySelector('body').getBoundingClientRect();
  chrome.windows.create({
    url: href,
    type: 'popup',
    width: bodyRect.width,
    height: bodyRect.height + 150,
  });
}

function BindListenersToElements(element) {
  // elements
  let closes = Array.from(document.getElementsByClassName('cclose'));
  let urlTexts = Array.from(document.getElementsByClassName('item'))
  let audio = Array.from(document.getElementsByClassName('audio'))

  // listeners
  closes.map(function (close) {
    close.addEventListener('click', function (e) {
      closeTab(e.path[0].id);
    });
  })

  urlTexts.map(function (urlText) {
    urlText.addEventListener('click', function (e) {
      selectTab(e.path[1].childNodes[3].id);
    });
  })

  audio.map(function (audioEl) {
    audioEl.addEventListener('click', function (e) {
      muteTab(e.path[1].lastChild.id);
    });
  })

}