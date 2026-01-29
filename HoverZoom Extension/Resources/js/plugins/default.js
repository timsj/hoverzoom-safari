// HoverZoom+ Safari Port - default.js plugin
// Fallback plugin for generic image/video/audio links

var hoverZoomPlugins = hoverZoomPlugins || [];
hoverZoomPlugins.push({
  name: "Default",
  version: "0.8",
  prepareImgLinks: function (callback) {
    const res = [];
    const reVideos =
      /\/[^:]+\.(?:3gpp|m4v|mkv|mp4|ogv|webm)(?:[\?#].*)?(?:\/)?$/i;
    const reImages =
      /\/[^:]+\.(?:avif|bmp|gifv?|ico|jfif|jpe|jpe?g|png|svg|webp|xbm)(?:[\?#].*)?(?:\/)?$/i;
    const rePlaylists = /\/[^:]+\.(?:m3u8)(?:[\?#].*)?(?:\/)?$/i;
    const reAudios =
      /\/[^:]+\.(?:flac|m4a|mp3|oga|ogg|opus|wav)(?:[\?#].*)?(?:\/)?$/i;

    // Handle <a href> elements pointing to image files
    $("a[href]")
      .filter(function () {
        if (typeof this.href != "string") return false;
        if (this.href.substr(0, 10).toLowerCase() === "data:image")
          return false;
        if (this.href.match(reImages)) return true;
        if (this.href.match(reVideos)) return true;
        if (this.href.match(rePlaylists)) return true;
        if (this.href.match(reAudios)) return true;
        return false;
      })
      .each(function () {
        const _this = $(this),
          data = _this.data();
        if (!data.hoverZoomSrc) {
          const src = this.href;
          if (
            !options.zoomVideos ||
            ((src.indexOf("imgur.com") === -1 ||
              src.indexOf("slimgur.com") !== -1) &&
              src.indexOf("gfycat.com") === -1)
          ) {
            data.hoverZoomSrc = [src];
            res.push(_this);
          }
        }
      });

    // Handle <img> elements - try to get full size version
    $("img[src]")
      .filter(function () {
        if ($(this).hasClass("hoverZoomLink")) return false;
        if ($(this).data().hoverZoomSrc) return false;
        const src = this.src || "";
        if (src.substr(0, 5) === "data:") return false;
        // Skip very small images (likely icons)
        if (this.naturalWidth && this.naturalWidth < 50) return false;
        if (this.naturalHeight && this.naturalHeight < 50) return false;
        return true;
      })
      .each(function () {
        const _this = $(this),
          data = _this.data();
        let fullSrc = null;

        // Try to get larger image from srcset
        const srcset = this.getAttribute("srcset");
        if (srcset) {
          fullSrc = hoverZoom.getBiggestSrcFromSrcset(srcset);
        }

        // Try data-src attributes (lazy loading)
        if (!fullSrc) {
          fullSrc =
            this.getAttribute("data-src") ||
            this.getAttribute("data-original") ||
            this.getAttribute("data-lazy-src") ||
            this.getAttribute("data-full-src") ||
            this.getAttribute("data-large-src");
        }

        // Wikipedia/Wikimedia: convert thumbnail to full size
        if (!fullSrc && this.src.indexOf("upload.wikimedia.org") !== -1) {
          // Thumbnail pattern: /thumb/a/ab/File.jpg/220px-File.jpg
          // Full size pattern: /a/ab/File.jpg
          const thumbMatch = this.src.match(
            /\/thumb(\/[a-z0-9]\/[a-z0-9]{2}\/.+?)\/\d+px-/i,
          );
          if (thumbMatch) {
            fullSrc = this.src.replace(
              /\/thumb(\/[a-z0-9]\/[a-z0-9]{2}\/.+?)\/\d+px-.+$/i,
              "$1",
            );
          }
        }

        // Generic thumbnail patterns - try to get larger version
        if (!fullSrc) {
          let src = this.src;
          // Pattern: image_thumb.jpg -> image.jpg
          if (src.match(/_thumb\./i)) {
            fullSrc = src.replace(/_thumb\./i, ".");
          }
          // Pattern: image_small.jpg -> image.jpg or image_large.jpg
          else if (src.match(/_(?:small|sm|xs|s)\./i)) {
            fullSrc = src.replace(/_(?:small|sm|xs|s)\./i, ".");
          }
          // Pattern: image-100x100.jpg -> image.jpg
          else if (src.match(/-\d+x\d+\./i)) {
            fullSrc = src.replace(/-\d+x\d+\./i, ".");
          }
          // Pattern: image.jpg?w=100 -> image.jpg
          else if (src.match(/\?.*(?:w|width|h|height|size)=/i)) {
            fullSrc = src.split("?")[0];
          }
        }

        // Fallback to current src if no larger version found
        if (!fullSrc) {
          fullSrc = this.src;
        }

        // Make sure it's a full URL
        if (
          fullSrc &&
          !fullSrc.startsWith("http") &&
          !fullSrc.startsWith("//")
        ) {
          if (fullSrc.startsWith("/")) {
            fullSrc = window.location.origin + fullSrc;
          } else {
            fullSrc = window.location.origin + "/" + fullSrc;
          }
        }

        if (fullSrc && fullSrc !== this.src) {
          data.hoverZoomSrc = [fullSrc, this.src]; // Try full first, fallback to original
          res.push(_this);
        } else if (fullSrc) {
          // Even if same as src, allow zoom if image is larger than displayed
          const displayedWidth = _this.width();
          const displayedHeight = _this.height();
          if (
            this.naturalWidth > displayedWidth * 1.2 ||
            this.naturalHeight > displayedHeight * 1.2
          ) {
            data.hoverZoomSrc = [fullSrc];
            res.push(_this);
          }
        }
      });

    // Handle links containing images (e.g., Wikipedia file links)
    $("a[href] img")
      .filter(function () {
        const link = $(this).closest("a");
        if (link.hasClass("hoverZoomLink")) return false;
        if (link.data().hoverZoomSrc) return false;
        return true;
      })
      .each(function () {
        const _this = $(this);
        const link = _this.closest("a");
        const linkData = link.data();
        const href = link.attr("href") || "";

        // Skip if already processed
        if (linkData.hoverZoomSrc) return;

        let fullSrc = null;

        // Wikipedia/Wikimedia file pages
        if (href.match(/\/wiki\/File:/i) || href.match(/\/wiki\/Image:/i)) {
          // Get full size from the thumbnail in the link
          const imgSrc = this.src;
          if (imgSrc.indexOf("upload.wikimedia.org") !== -1) {
            const thumbMatch = imgSrc.match(
              /\/thumb(\/[a-z0-9]\/[a-z0-9]{2}\/.+?)\/\d+px-/i,
            );
            if (thumbMatch) {
              fullSrc = imgSrc.replace(
                /\/thumb(\/[a-z0-9]\/[a-z0-9]{2}\/.+?)\/\d+px-.+$/i,
                "$1",
              );
            }
          }
        }

        // If link points to an image file directly
        if (!fullSrc && href.match(reImages)) {
          fullSrc = href;
        }

        if (fullSrc) {
          linkData.hoverZoomSrc = [fullSrc];
          res.push(link);
        }
      });

    // handle <video[src]> elements
    $("video[src]")
      .filter(function () {
        $(this).data().hoverZoomSrc = [];
        if (!options.zoomVideos) return false;
        if (typeof this.src != "string") return false;
        if (this.src.match(/^blob:/)) return false;
        return true;
      })
      .each(function () {
        var _this = $(this),
          data = _this.data();
        // discard video already being played
        if (this.paused || this.controls === false) {
          var src = this.src;
          if (!src.match(reVideos)) src += ".video";
          data.hoverZoomSrc = [src];
          res.push(_this);
        }
      });

    // handle <video><source[src]> elements
    $("video:not([src])")
      .filter(function () {
        $(this).data().hoverZoomSrc = [];
        if (!options.zoomVideos) return false;
        if ($(this).find("source[src]")[0] == undefined) return false;
        var src = $(this).find("source[src]")[0].src;
        if (typeof src != "string") return false;
        return true;
      })
      .each(function () {
        var _this = $(this),
          data = _this.data();
        // discard video already being played
        if (this.paused) {
          var src = _this.find("source")[0].src;
          if (!src.match(reVideos)) src += ".video";
          data.hoverZoomSrc = [src];
          res.push(_this);
        }
      });

    // handle <audio[src]> elements
    $("audio[src]")
      .filter(function () {
        if (!options.playAudio) return false;
        var divAudio = $(this).parents("div")[0];
        if (divAudio == undefined) return false;
        $(divAudio).data().hoverZoomSrc = [];
        if (typeof this.src != "string") return false;
        return true;
      })
      .each(function () {
        var _this = $(this),
          divAudio = _this.parents("div")[0],
          _divAudio = $(divAudio),
          data = _divAudio.data();
        // discard audio already being played
        if (this.paused) {
          var src = this.src;
          if (!src.match(reAudios)) src += ".audio";
          data.hoverZoomSrc = [src];
          res.push(_divAudio);
        }
      });

    // handle <audio><source[src]> elements
    $("audio:not([src])")
      .filter(function () {
        $(this).data().hoverZoomSrc = [];
        if (!options.playAudio) return false;
        if ($(this).find("source[src]")[0] == undefined) return false;
        var src = $(this).find("source[src]")[0].src;
        if (typeof src != "string") return false;
        return true;
      })
      .each(function () {
        var _this = $(this),
          data = _this.data();
        // discard audio already being played
        if (this.paused) {
          var src = _this.find("source")[0].src;
          if (!src.match(reAudios)) src += ".audio";
          data.hoverZoomSrc = [src];
          res.push(_this);
        }
      });

    if (res.length) {
      callback($(res), this.name);
    }
  },
});
