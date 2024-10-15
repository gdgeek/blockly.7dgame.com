function printVector3(vec) {
  return "(" + vec.x + ", " + vec.y + ", " + vec.z + ")";
}
function printVector2(vec) {
  return "(" + vec.x + ", " + vec.y + ")";
}
function cutString(str, len) {
  if (str.length * 2 <= len) {
    return str;
  }
  var strlen = 0;
  var s = "";
  for (var i = 0; i < str.length; i++) {
    s = s + str.charAt(i);
    if (str.charCodeAt(i) > 128) {
      strlen = strlen + 2;
      if (strlen >= len) {
        return s.substring(0, s.length - 1) + "...";
      }
    } else {
      strlen = strlen + 1;
      if (strlen >= len) {
        return s.substring(0, s.length - 2) + "...";
      }
    }
  }
  return s;
}
function isHttps() {
  // 获取当前页面的协议
  const protocol = window.location.protocol;
  // 检查协议是否是HTTPS
  if (protocol === "https:") {
    console.log("这个网页是使用HTTPS");
    return true;
  } else {
    console.log("这个网页不是使用HTTPS");
    return false;
  }
}
function convertToHttps(url) {
  if (isHttps()) {
    if (url !== undefined || (url !== null) & url.startsWith("http://")) {
      // 替换'http://'为'https://'
      return url.replace("http://", "https://");
    }
  } else {
    if (url !== undefined || (url !== null) & url.startsWith("https://")) {
      // 替换'http://'为'https://'
      return url.replace("https://", "http://");
    }
  }

  return url;
}

export { isHttps, convertToHttps, printVector3, printVector2, cutString };
