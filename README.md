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

# Interface theme detection
`SwiftyMonaco` automatically detects interface theme changes and updates Monaco Editor theme according to it without dropping the current state of the editor.
<img width="1012" alt="image" src="https://user-images.githubusercontent.com/17158860/111897521-60620800-8a31-11eb-9250-ec45b40e56cf.png">
<img width="1012" alt="image" src="https://user-images.githubusercontent.com/17158860/111897745-b7b4a800-8a32-11eb-8783-d21d96b4cc10.png">
