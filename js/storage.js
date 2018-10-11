function saveUrlsLocally(window, windowId) {
    var selectedTabs = getSelectedTabs(true);
    chrome.windows.get(Number(windowId), { populate: true }, function (tab) {
        const uuid = guid();
        let setObj = [];
        try {
            setObj[uuid] = tab.tabs;
            if (selectedTabs[1].length > 0) {
                setObj[uuid].forEach(function (tab) {
                    console.log(tab.id)
                    console.log(selectedTabs[1])
                    if (!selectedTabs[1].includes(tab.id.toString())) {
                        setObj[uuid] = remove(setObj[uuid], tab);
                    }
                })
            }
        } catch (err) {
            throw new Error(err);
        } finally {
            var arrayToObject = Object.assign({}, setObj);
            chrome.storage.local.set(arrayToObject, function (e) {
                setTimeout(function () {
                    let element = document.getElementById(windowId).getElementsByClassName('savelocally');
                    element[0].setAttribute('src', 'img/save.png')
                }, 1000);
            });
        }

    })
}
// remove element from the array
function remove(array, element) {
    return array.filter(e => e !== element);
}
// generate random uuid
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// generates new window for saved links
function generateSavedListWindow(allKeys) {
    console.log(allKeys);
    let savedList = document.getElementById('cbListSaved');
    savedList.style.display = '';
    if (allKeys.length > 0) {
        savedList.innerHTML = "";
        console.log("a")
        allKeys.map(function (key) {
            chrome.storage.local.get(key, function (tabsObj) {

                let color = getRandomColor();
                let listId = "list_" + key;

                let trashLocally = document.createElement('div');
                let trashLocallyImg = document.createElement('img');
                let selectAll = document.createElement('img');
                trashLocallyImg.setAttribute('src', "img\\trash.png");
                trashLocallyImg.style.width = "16px";
                trashLocallyImg.style.height = "16px";
                trashLocallyImg.className = "trashlocally";
                trashLocallyImg.title="Remove from Bookmarks"
                
                selectAll.setAttribute('src', "img/select.png");
                selectAll.style.width = "16px";
                selectAll.style.height = "16px";
                selectAll.title = "Select all";
                selectAll.className = "selectAll";
                selectAll.style.marginBottom = "-1px";
                selectAll.style.marginRight = "0.3em";
                selectAll.addEventListener('click',function(e){
                    
                  let savedListDOM=e.target.parentNode.parentNode.lastChild;
                let lp=savedListDOM.childNodes;
                    for(var i=0;i<lp.length;i++){
                        lp[i].firstChild.click();
                    }
                   
                });
                // windowsList.push(listId);
                trashLocallyImg.addEventListener('click', function (e) {
                    removeWindow(e.target.parentElement.parentElement.id);
                });
                let list = document.createElement("div");
                list.setAttribute('id', listId);
                list.classList.add("listMain")
                list.id = key;
                trashLocally.style.backgroundColor = "white";
                trashLocally.style.position = "relative";
                trashLocally.style.textAlign = "right";
                trashLocally.appendChild(selectAll);
                trashLocally.appendChild(trashLocallyImg);
                list.appendChild(trashLocally);
                cbListSaved.appendChild(list);

                let ul = document.createElement("ul");
                ul.setAttribute('id', "list");
                list.setAttribute('style', 'border-left: 8px solid ' + color + '!important;')
                list.appendChild(ul);


                for (const key of Object.keys(tabsObj)) {
                    tabsObj[key].forEach(tab => {
                        let li = document.createElement("li");
                        let urlText = document.createElement("span");
                        let icon = document.createElement("img");
                        let checkbox = document.createElement("input");
                        // let close = document.createElement("input");
                        li.setAttribute("draggable", "true");
                        li.setAttribute("class", "listItem");
                        li.id = tab.index;
                        // TODO: possible bug here, could be undefined favicon url
                        if (tab.favIconUrl !== undefined) {
                             icon.setAttribute("src", tab.favIconUrl);
                        } else{
                            icon.setAttribute("src","");
                        }
                        icon.setAttribute("width", "16");
                        icon.setAttribute("height", "16");
                        icon.setAttribute("class", "urlIcon")
                        // close.setAttribute('class', 'cclose');
                        urlText.setAttribute("class", "saveditem");
                        urlText.textContent = tab.title.substring(0, 33);
                        urlText.title = tab.title;
                        urlText.addEventListener('click', function (e) {
                            openNewTab(e.target.previousSibling.previousSibling.value);
                        });
                        // close.value = 'x';
                        // close.type = 'button';
                        // close.style.fontWeight = 'bold';
                        // close.id = tab.id;
                        checkbox.setAttribute("type", "checkbox");
                        checkbox.setAttribute("name", "urlcb");
                        checkbox.setAttribute("class", "cb");
                        checkbox.value = tab.url;
                        // append tags
                        li.appendChild(checkbox);
                        li.appendChild(icon);
                        li.appendChild(urlText);
                        // li.appendChild(close);
                        ul.appendChild(li);
                    });
                }
            })
        })
    } else{
        console.log("test")
        savedList.innerHTML = "<center><p style='background-color:#e74132; color:white; font-wieght:600;'>such a lonely session page, save some tabs</p></center>"
    }
}
// remove locally saved urls
function removeWindow(key) {
    chrome.storage.local.remove(key, function (result) {
        $("#" + key).remove();
    });
    
    
    
}