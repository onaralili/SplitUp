"use strict"
// drag and drop using HTML5 

var dragSrcEl = null;
var movingToWindowId,currentWindowId = null
function handleDragStart(e) {
    // Target (this) element is the source node.
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);

    this.classList.add('dragElem');

    console.log("drag started..")
}
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    this.classList.add('over');

    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
}

function handleDragLeave(e) {
    this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
    // this/e.target is current target element.
    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
    }

    // Don't do anything if dropping the same column we're dragging.
    if (dragSrcEl != this) {
        console.log("the same target")
        console.log(dragSrcEl)
        console.log(this.parentNode.parentNode)
        movingToWindowId = this.parentNode.parentNode.id;
        currentWindowId = dragSrcEl.parentNode.parentNode.id;

        // console.log("movedW "+ movedWindow.id + "currentW" + currentWindow.id );
        // Set the source column's HTML to the HTML of the column we dropped on.
        //alert(this.outerHTML);
        //dragSrcEl.innerHTML = this.innerHTML;
        //this.innerHTML = e.dataTransfer.getData('text/html');
        if(currentWindowId==movingToWindowId){
            this.parentNode.removeChild(dragSrcEl);
        } else{
            dragSrcEl.parentNode.removeChild(dragSrcEl);
        }
        var dropHTML = e.dataTransfer.getData('text/html');
        this.insertAdjacentHTML('beforebegin', dropHTML);
        var dropElem = this.previousSibling;
        addDnDHandlers(dropElem);

    }
    this.classList.remove('over');



    return false;
}

function handleDragEnd(e) {
    // this/e.target is the source node.
    this.classList.remove('over');
   
   console.log(currentWindowId);
   console.log(movingToWindowId);

//    let windowId = Number(currentWindowId!=movingToWindowId ? movingToWindowId : currentWindowId);
    
   console.log(movingToWindowId)

    let elements = $("#"+movingToWindowId).find('li');
    elements.map(function(element){
        elements[element].id=element;
        let tabId = elements[element].lastChild.id;
        chrome.tabs.move(Number(tabId),{windowId:Number(movingToWindowId),index:element})
        $('meta').remove();
        // binds listeners to the elements
        BindListenersToElements();
    });
}

function addDnDHandlers(elem) {
    elem.addEventListener('dragstart', handleDragStart, false);
    elem.addEventListener('dragenter', handleDragEnter, false)
    elem.addEventListener('dragover', handleDragOver, false);
    elem.addEventListener('dragleave', handleDragLeave, false);
    elem.addEventListener('drop', handleDrop, false);
    elem.addEventListener('dragend', handleDragEnd, false);

}



