function checkBannedChars(param) {
    const banned_Chars = ['<', '>', '-', '{', '}', '[', ']', '(', ')', 'script', 'prompt', 'alert', 'write', 'send', '?', '!', '$', '#','\`','\"','\'','\;','\\','\/'];
    var textvalue = document.getElementById(param).value;
    for (var i = 0; i < banned_Chars.length; i++) {
        if (~textvalue.indexOf(banned_Chars[i])) {
            document.getElementById(param).value = String(textvalue).replace(banned_Chars[i], "");
            checkBannedChars(param)
        }
    }
}

const currentUrl = window.location.pathname;
Array.from(document.querySelectorAll('.navElement')).forEach(link => {
  if ((String(link.href).toLowerCase().includes(currentUrl.toLowerCase())) && (currentUrl !== "/")) {
    link.classList.add('activeNav');
  } else {
    if(link.href ==  window.location.href) link.classList.add('activeNav');
  }
});

