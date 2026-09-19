//
//  LanguageServer.swift
//

import Foundation

/// Configuration for a Language Server Protocol server exposed over WebSocket.
public struct LanguageServer {
    public init(
        url: URL,
        documentURI: String,
        workspaceRootURI: String? = nil
    ) {
        self.url = url
        self.documentURI = documentURI
        self.workspaceRootURI = workspaceRootURI
    }

    /// The `ws` or `wss` endpoint accepting JSON-RPC LSP messages.
    public var url: URL

    /// The URI used to identify this editor's document to the language server.
    public var documentURI: String

    /// An optional workspace root URI sent in the LSP initialize request.
    public var workspaceRootURI: String?
}
