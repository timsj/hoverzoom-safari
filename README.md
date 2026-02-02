# HoverZoom+ for Safari

A Safari port of the popular [HoverZoom+](https://github.com/extesy/hoverzoom) extension. There are currently no plans to distribute pre-built binaries or to go through the Apple Developer Program for signing/notarization, so you will have to build the extension from source on your own machine.

## Requirements

- macOS 10.14 or later
- Safari 14 or later
- Xcode 14 or later
- A valid Apple ID account

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/timsj/hoverzoom-safari.git
   cd hoverzoom-safari
   ```

2. Open the project in Xcode:

   ```bash
   open HoverZoom.xcodeproj
   ```

3. Select your team in the **Signing & Capabilities** section of the [project editor](https://help.apple.com/xcode/mac/current/en.lproj/devdab46c612.html#devdab46c612) for both the **HoverZoom** (host macOS app) and **HoverZoom Extension** targets. More information about this process can be found [here](https://help.apple.com/xcode/mac/current/en.lproj/dev23aab79b4.html#dev23aab79b4).

4. Select **Product → Run** (⌘R). This will build the project and launch the host app.

5. Go to **Safari → Settings → Extensions** and enable **HoverZoom+**

### Command Line Build

If you have [Xcode command-line tools](https://developer.apple.com/documentation/xcode/installing-the-command-line-tools) installed and have signing already configured per step 3 above, you can build directly from the terminal instead of opening Xcode every time by using this command in the project directory:

```bash
xcodebuild -scheme HoverZoom -configuration Release -derivedDataPath ./build && open ./build/Build/Products/Release/HoverZoom.app
```

This will create the binaries in the `./build` folder and open the host app automatically for registration after a successful build.

## Troubleshooting

### Extension doesn't appear in Safari Settings

Try the following actions:

- Make sure you've built and run the app in Xcode at least once
- Ensure you selected a valid team in Signing & Capabilities for **both** the HoverZoom and HoverZoom Extension targets in the Xcode project editor

### Images not zooming on a specific site

Some sites may not be fully supported or may have changed their structure since this extension was updated. This extension works best on sites with dedicated plugins, and at this time, only a [handful of these plugins](https://github.com/timsj/hoverzoom-safari/tree/main/HoverZoom%20Extension/Resources/js/plugins) were ported from the original extension.

### Full-res images not appearing on some sites

Some sites like DuckDuckGo use strict Content Security Policy (CSP) headers that block the extension from loading full-resolution images from external domains. This is a browser-enforced security restriction that currently cannot be bypassed by the Safari extension.

## Credits

This is a Safari port of [HoverZoom+](https://github.com/extesy/hoverzoom) by extesy. All credit for the core functionality and site plugins goes to the original project contributors.

## License

As with the original project, this project is licensed under the MIT License.
