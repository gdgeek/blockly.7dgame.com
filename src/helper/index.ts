interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Vector2 {
  x: number;
  y: number;
}

function printVector3(vec: Vector3): string {
  return "(" + vec.x + ", " + vec.y + ", " + vec.z + ")";
}

function printVector2(vec: Vector2): string {
  return "(" + vec.x + ", " + vec.y + ")";
}

function cutString(str: string, len: number): string {
  if (str.length * 2 <= len) {
    return str;
  }
  let strlen = 0;
  let s = "";
  for (let i = 0; i < str.length; i++) {
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

function isHttps(): boolean {
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

function convertToHttps(url: string): string {
  if (isHttps()) {
    // eslint-disable-next-line no-bitwise -- 保留原始逻辑
    if (url !== undefined || (Number(url !== null) & Number((url as string).startsWith("http://")))) {
      // 替换'http://'为'https://'
      return url.replace("http://", "https://");
    }
  } else {
    // eslint-disable-next-line no-bitwise -- 保留原始逻辑
    if (url !== undefined || (Number(url !== null) & Number((url as string).startsWith("https://")))) {
      // 替换'http://'为'https://'
      return url.replace("https://", "http://");
    }
  }

  return url;
}

export { isHttps, convertToHttps, printVector3, printVector2, cutString };
export type { Vector3, Vector2 };
