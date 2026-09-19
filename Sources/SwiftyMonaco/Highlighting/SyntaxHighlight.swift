//
//  SyntaxHighlight.swift
//  
//
//  Created by Pavel Kasila on 20.03.21.
//

import Foundation

public struct SyntaxHighlight {
    enum LanguageSelector {
        case mimeType(String)
        case fileExtension(String)
    }

    let languageSelector: LanguageSelector?

    public init(title: String, configuration: String) {
        self.title = title
        self.configuration = configuration
        self.languageSelector = nil
    }
    
    public init(title: String, fileURL: URL) {
        self.title = title
        self.configuration = String(data: try! Data(contentsOf: fileURL), encoding: .utf8)!
        self.languageSelector = nil
    }

    /// Uses a language bundled with Monaco, selected by one of its registered MIME types.
    ///
    /// For example, `SyntaxHighlight(mimeType: "application/json")`.
    public init(mimeType: String) {
        self.title = mimeType
        self.configuration = ""
        self.languageSelector = .mimeType(mimeType)
    }

    /// Uses a language bundled with Monaco, selected by one of its registered file extensions.
    ///
    /// Both `"swift"` and `".swift"` are accepted.
    public init(fileExtension: String) {
        let normalizedExtension = fileExtension.hasPrefix(".") ? fileExtension : ".\(fileExtension)"
        self.title = normalizedExtension
        self.configuration = ""
        self.languageSelector = .fileExtension(normalizedExtension)
    }
    
    public var title: String
    public var configuration: String
}

public extension SyntaxHighlight {
    static let swift = SyntaxHighlight(title: "Swift", fileURL: Bundle.module.url(forResource: "swift", withExtension: "js", subdirectory: "Languages")!)
    static let cpp = SyntaxHighlight(title: "C++", fileURL: Bundle.module.url(forResource: "cpp", withExtension: "js", subdirectory: "Languages")!)
    static let systemVerilog = SyntaxHighlight(title: "SystemVerilog/Verilog", fileURL: Bundle.module.url(forResource: "systemVerilog", withExtension: "js", subdirectory: "Languages")!)
}
