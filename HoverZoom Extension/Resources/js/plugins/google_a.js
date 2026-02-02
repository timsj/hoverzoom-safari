var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name: "GoogleUserContent",
  version: "1.4",
  prepareImgLinks: function (callback) {
    var res = [];

    // sample url: https://lh3.googleusercontent.com/...=w192-c-h192-fcrop64=1,00000b5cffffdde9-rw-v1
    //          -> https://lh3.googleusercontent.com/...=s0
    // sample url: https://yt3.ggpht.com/ytc/...=s68-c-k-c0x00ffffff-no-rj
    //          -> https://yt3.ggpht.com/ytc/...=s0
    const filter1 =
      /\.googleusercontent\.com\/|\.ggpht\.com\/|\.google\.com\//;
    const regex1 = /(.*?=)(.*)/;
    const patch1 = "$1s0";

    // sample url: https://lh5.googleusercontent.com/.../photo.jpg?sz=64
    //          -> https://lh5.googleusercontent.com/.../photo.jpg
    const filter3 = /\.googleusercontent\.com\//;
    const regex3 = /(.*photo.jpg)\?.*/;
    const patch3 = "$1";

    // sample url: http://geo3.ggpht.com/cbk?...&w=100&h=100&...
    //          -> http://geo3.ggpht.com/cbk?...&w=9999&h=9999&...
    const filter4 = /\.googleusercontent\.com\/|\.ggpht\.com\//;
    const regex4 = /(&[hw]{1})=\d+/g;
    const patch4 = "$1=9999";

    // images

    hoverZoom.urlReplace(
      res,
      'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"], img[src*=".google.com/"]',
      regex1,
      patch1,
    );

    hoverZoom.urlReplace(
      res,
      'img[src*=".googleusercontent.com/"]',
      regex3,
      patch3,
    );

    hoverZoom.urlReplace(
      res,
      'img[src*=".googleusercontent.com/"], img[src*=".ggpht.com/"]',
      regex4,
      patch4,
    );

    // background images (e.g: divs)

    $("[style*=url]").each(function () {
      var link = $(this);
      // extract url from style
      var backgroundImage = this.style.backgroundImage;
      const reUrl = /.*url\s*\(\s*(.*)\s*\).*/i;
      backgroundImage = backgroundImage.replace(reUrl, "$1");
      // remove leading & trailing quotes
      var backgroundImageUrl = backgroundImage
        .replace(/^['"]/, "")
        .replace(/['"]+$/, "");

      $([
        { f: filter1, r: regex1, p: patch1 },
        { f: filter3, r: regex3, p: patch3 },
        { f: filter4, r: regex4, p: patch4 },
      ]).each(function () {
        if (this.f.test(backgroundImageUrl)) {
          var fullsizeUrl = backgroundImageUrl.replace(this.r, this.p);
          if (fullsizeUrl != backgroundImageUrl) {
            if (link.data().hoverZoomSrc == undefined) {
              link.data().hoverZoomSrc = [];
            }
            if (link.data().hoverZoomSrc.indexOf(fullsizeUrl) == -1) {
              link.data().hoverZoomSrc.unshift(fullsizeUrl);
              res.push(link);
            }
          }
        }
      });
    });

    callback($(res), this.name);
  },
});
