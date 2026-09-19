import XCTest
@testable import SwiftyMonaco

final class SwiftyMonacoTests: XCTestCase {
    func testMimeTypeSyntaxHighlight() {
        let syntax = SyntaxHighlight(mimeType: "application/json")

        guard case .mimeType(let mimeType) = syntax.languageSelector else {
            return XCTFail("Expected a MIME type selector")
        }
        XCTAssertEqual(mimeType, "application/json")
    }

    func testFileExtensionSyntaxHighlightAddsLeadingPeriod() {
        let syntax = SyntaxHighlight(fileExtension: "swift")

        guard case .fileExtension(let fileExtension) = syntax.languageSelector else {
            return XCTFail("Expected a file extension selector")
        }
        XCTAssertEqual(fileExtension, ".swift")
    }

    func testFileExtensionSyntaxHighlightPreservesLeadingPeriod() {
        let syntax = SyntaxHighlight(fileExtension: ".ts")

        guard case .fileExtension(let fileExtension) = syntax.languageSelector else {
            return XCTFail("Expected a file extension selector")
        }
        XCTAssertEqual(fileExtension, ".ts")
    }

    func testLanguageServerConfiguration() {
        let url = URL(string: "ws://localhost:8080")!
        let server = LanguageServer(
            url: url,
            documentURI: "file:///workspace/main.swift",
            workspaceRootURI: "file:///workspace"
        )

        XCTAssertEqual(server.url, url)
        XCTAssertEqual(server.documentURI, "file:///workspace/main.swift")
        XCTAssertEqual(server.workspaceRootURI, "file:///workspace")
    }

    static var allTests = [
        ("testMimeTypeSyntaxHighlight", testMimeTypeSyntaxHighlight),
        ("testFileExtensionSyntaxHighlightAddsLeadingPeriod", testFileExtensionSyntaxHighlightAddsLeadingPeriod),
        ("testFileExtensionSyntaxHighlightPreservesLeadingPeriod", testFileExtensionSyntaxHighlightPreservesLeadingPeriod),
        ("testLanguageServerConfiguration", testLanguageServerConfiguration),
    ]
}
