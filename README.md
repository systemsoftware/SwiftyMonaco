# SwiftyMonaco

SwiftyMonaco is a wrapper for Monaco Editor from Microsoft.

<img width="1012" alt="image" src="https://user-images.githubusercontent.com/17158860/111897521-60620800-8a31-11eb-9250-ec45b40e56cf.png">

# How to use?
There is a simple example of how to use `SwiftyMonaco`
```swift
import SwiftUI

struct EditorView: View {
    @State var text: String
    
    var body: some View {
        SwiftyMonaco(text: $text)
    }
}
```
**Remember!** You should allow outgoing internet connections in your app before using this library, because Monaco Editor runs inside `WKWebView` and macOS considers it as an outgoing internet connection (`Network -> Outgoing connections (Client)`):

<img width="1512" alt="image" src="https://user-images.githubusercontent.com/17158860/131391125-996cf6de-228b-41f4-b240-722437a62f64.png">

## Syntax Highlighting

### Monaco languages

This fork allows for any language bundled with Monaco to be selected by MIME type or file extension:

```swift
SwiftyMonaco(text: $text)
    .syntaxHighlight(mimeType: "application/json")

SwiftyMonaco(text: $text)
    .syntaxHighlight(fileExtension: ".ts")
```

The file extension may be passed with or without its leading period:

```swift
SwiftyMonaco(text: $text)
    .syntaxHighlight(fileExtension: "json")
```

You can also create a `SyntaxHighlight` value directly when it needs to be stored or passed separately:

```swift
let json = SyntaxHighlight(mimeType: "application/json")
let typescript = SyntaxHighlight(fileExtension: ".ts")

SwiftyMonaco(text: $text)
    .syntaxHighlight(json)
```

Matching uses Monaco's registered language metadata. MIME types are case-insensitive and may include parameters such as `charset`. Unknown MIME types and extensions fall back to plain text.

### Included custom languages

SwiftyMonaco also includes custom Monarch definitions that can be passed to `syntaxHighlight`:

| `SyntaxHighlight` | Language |
| --- | --- |
| `.swift` | Swift |
| `.cpp` | C++ |
| `.systemVerilog` | Verilog/SystemVerilog |

```swift
SwiftyMonaco(text: $text)
    .syntaxHighlight(.systemVerilog)
```

### Custom Monarch languages

Create a custom `SyntaxHighlight` from either a JavaScript file or a string containing a Monarch language definition:

```swift
let fileSyntax = SyntaxHighlight(
    title: "My custom language",
    fileURL: Bundle.module.url(
        forResource: "lang",
        withExtension: "js",
        subdirectory: "Languages"
    )!
)

let inlineSyntax = SyntaxHighlight(
    title: "My custom language",
    configuration: "..."
)
```

See the [Monaco Monarch documentation](https://microsoft.github.io/monaco-editor/monarch.html) for the language-definition format.

## IntelliSense and language servers

Monaco provides built-in IntelliSense for JavaScript, TypeScript, JSON, CSS, and HTML. Select one of those languages by MIME type or file extension and Monaco automatically activates its bundled language service:

```swift
SwiftyMonaco(text: $text)
    .syntaxHighlight(fileExtension: ".ts")
```

For other languages, connect a Language Server Protocol server exposed over WebSocket:

```swift
let server = LanguageServer(
    url: URL(string: "ws://localhost:8080")!,
    documentURI: "file:///workspace/main.swift",
    workspaceRootURI: "file:///workspace"
)

SwiftyMonaco(text: $text)
    .syntaxHighlight(fileExtension: ".swift")
    .languageServer(server)
```

The LSP bridge supports full-document synchronization, completion suggestions, hover information, and diagnostics. The endpoint must accept JSON-RPC LSP messages directly over WebSocket; stdio-only language servers need a WebSocket proxy. On macOS, make sure the app has the outgoing network connection entitlement described above.

# Interface theme detection
`SwiftyMonaco` automatically detects interface theme changes and updates Monaco Editor theme according to it without dropping the current state of the editor.
<img width="1012" alt="image" src="https://user-images.githubusercontent.com/17158860/111897521-60620800-8a31-11eb-9250-ec45b40e56cf.png">
<img width="1012" alt="image" src="https://user-images.githubusercontent.com/17158860/111897745-b7b4a800-8a32-11eb-8783-d21d96b4cc10.png">
