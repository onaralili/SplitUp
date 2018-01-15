document.addEventListener('DOMContentLoaded', () => {
  var btSplit = document.getElementById('btSplit');
  var urlList = [];
  var windowsList = [];
  btSplit.addEventListener('click', () => {

    var checkedBoxes = document.querySelectorAll('input[name=urlcb]:checked');

    checkedBoxes.forEach(function (e) {
      urlList.push(e.value);
    })

    //creates a window
    if (urlList != null) {
      chrome.windows.create({
        url: urlList,
        type: "normal"
      });
    }
  })

  chrome.windows.getAll({ populate: true }, function (windows) {
    var cbList = document.getElementById("cbList");
    // let ul = document.createElement("ul");
    // ul.setAttribute("class","list");

    windows.forEach(function (window) {
      console.log("win. id " + window.id)
      let color = getRandomColor();
      let listId = "list_" + window.id;
      windowsList.push(listId);

      let list = document.createElement("div");
      list.setAttribute('id', listId);
      list.classList.add("listMain")
      cbList.appendChild(list);

      let ul = document.createElement("ul");
      // ul.classList.add("list");  
      ul.setAttribute('id', "list");
      ul.setAttribute('style', 'background-color: #f0ffee!important;border-color: #2196F3!important;border-left: 6px solid ' + color + '!important;')
      list.appendChild(ul);

      window.tabs.forEach(function (tab) {

        // main tag
        let li = document.createElement("li");
        let urlText = document.createElement("span");
        let icon = document.createElement("img");
        let checkbox = document.createElement("input");
        icon.setAttribute("src", tab.favIconUrl);
        icon.setAttribute("width", "16");
        icon.setAttribute("height", "16");
        icon.setAttribute("class", "urlIcon")
        urlText.setAttribute("class", "item");
        urlText.textContent = tab.title.substring(0, 50);
        urlText.title = tab.title;
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "urlcb");
        checkbox.setAttribute("class", "cb");
        checkbox.value = tab.url;
        // append tags
        li.appendChild(checkbox);
        li.appendChild(icon);
        li.appendChild(urlText);
        ul.appendChild(li);
      });
    });

  });

  $(".search").keyup(function () {
    search();
  });

});

// generates a random color
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// search through the item tags
function search() {
  var input, filter, ul, li, a, i;
  input = document.getElementsByClassName('search');
  console.log(input);
  filter = input[0].value.toUpperCase();
  ul = document.getElementsByClassName("listMain");
  console.log(ul);

  for (t = 0; t < ul.length; t++) {
    
    li = ul[t].getElementsByTagName('li');

    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("span")[0];
      console.log(a);
      if (a.title.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }

}