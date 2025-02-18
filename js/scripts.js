if(document.querySelector('.menu-bar > ul > li')){
document.querySelectorAll('.menu-bar > ul > li').forEach(function(c, index) {
c.setAttribute('id', 'listitem-' + index);
});
}
document.querySelectorAll('.menu-bar li').forEach(function(c, index) {
var emptyUl = c.querySelector('ul:empty');
if(emptyUl){
emptyUl.remove()
}
});
if(document.querySelector('#menu-bar ul li > a')){
document.querySelectorAll('#menu-bar ul li > a').forEach(function(c) {
c.setAttribute('title', c.getAttribute('title').replace(/(<[^>]*>|_)/g, '').replace(/#/g, ''));
});
}
if(document.querySelector('#menu-bar .subMenu a')){
document.querySelectorAll('#menu-bar .subMenu a').forEach(function(c) {
c.innerHTML = c.innerHTML.replace(/_/g, '').replace(/#/g, '');
});
}
if(document.querySelector('#menu-bar .MegaMenu > ul')){
document.querySelectorAll('#menu-bar .MegaMenu > ul').forEach(function(c) {
c && c.remove();;
});
}
if(document.querySelector('#menu-bar .MegaMenu')){
document.querySelectorAll('#menu-bar .MegaMenu').forEach(function(c) {
var e = c.querySelector('a:first-of-type');
if(e.href.indexOf(",") > -1){
e.href = '/search/label/' + decodeURIComponent(e.title) + '?max-results=' + getMaxResults;
} else {
var n = e.href.slice(e.href.indexOf("[") + 1, e.href.indexOf("]")).trim(),
sln = decodeURIComponent(n) === 'recent' || decodeURIComponent(n) === 'random' ? e.href = '/search?max-results=' + getMaxResults : e.href = '/search/label/' + decodeURIComponent(n) + '?max-results=' + getMaxResults;
}
})
}